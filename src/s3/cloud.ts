import { CreateBucketCommand, DeleteObjectCommand, HeadBucketCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { imageData, imageMeta } from "../database/types";
import PalantirDatabase from "../database/mysql/palantirDatabase";
import { Snowflake } from "@theinternetfolks/snowflake";

export interface metaTags {
    title: string;
    author: string;
    own: boolean;
    date: number;
    language: string;
    private: boolean;
}

export class S3CloudConnection {

    private readonly bucketName = "cloud";
    private client: S3Client;
    private userID?: string;

    constructor(key: string, secret: string, private palantirToken: number, private database: PalantirDatabase) {
        this.client = new S3Client({
            credentials: {
                accessKeyId: key,
                secretAccessKey: secret,
            },
            endpoint: "https://eu2.contabostorage.com/",
            region: "us-east-1",
            forcePathStyle: true,
        });
    }

    get userFolder() {
        if (!this.userID) throw new Error("userID not set");
        return this.userID;
    }

    /**
     * inits necessary constraints
     */
    async init() {
        this.userID = await this.getUserDiscordID();
        await this.ensureBucketExists(this.bucketName);
    }

    /**
     * opens a db conenction and gets the discord id of the user
     * @returns user id string
     */
    private async getUserDiscordID() {
        const user = await this.database.getUserByLogin(this.palantirToken);
        return user.result.member.UserID;
    }

    /**
     * checks if a bucket exists and creates it if not, using promises and s3 v3 sdk
     */
    private async ensureBucketExists(bucketName: string): Promise<void> {
        try {
            await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
        }
        catch (error) {
            if ((error as any).name === "NotFound") {
                const createBucketParams = {
                    Bucket: bucketName,
                    ACL: 'public-read'
                };

                try {
                    await this.client.send(new CreateBucketCommand(createBucketParams));
                } catch (error) {
                    throw new Error("Error creating bucket: " + JSON.stringify(error));
                }
            } else {
                throw new Error("Error checking bucket existence: " + JSON.stringify(error));
            }
        }
    }

    private async uploadObjectToS3(data: Uint8Array | string | ReadableStream<Uint8Array>, key: string, contentType: string, tags?: string): Promise<void> {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: data,
            ContentType: contentType,
            Tagging: tags
        };

        const command = new PutObjectCommand(params);
        await this.client.send(command);
    }

    /**
     * uploads meta, image and commands to s3
     */
    async saveDrawing(drawing: imageData) {
        const uuid = Snowflake.generate();

        const image = Buffer.from(drawing.uri.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const commandsString = JSON.stringify(drawing.commands);

        const meta = typeof drawing.meta === 'string' ? JSON.parse(drawing.meta as any) as imageMeta : drawing.meta;
        const metaString = JSON.stringify(meta);

        const metaTags: metaTags = {
            title: meta.name,
            author: meta.author,
            own: meta.own,
            date: new Date(meta.date).getTime(),
            language: meta.language,
            private: meta.private
        };

        await this.uploadObjectToS3(metaString, `${this.userFolder}/${uuid}/meta.json`, "application/json");
        await this.uploadObjectToS3(commandsString, `${this.userFolder}/${uuid}/commands.json`, "application/json");
        await this.uploadObjectToS3(image, `${this.userFolder}/${uuid}/image.png`, "image/png");

        await this.database.addCloudMeta(metaTags, this.palantirToken.toString(), uuid);

        return uuid;
    }

    async searchObjectsByTags(tags: Partial<metaTags>, limit: number = -1) {
        const matches = await this.database.getCloudMetaMatch(tags, this.palantirToken.toString(), limit === -1 ? 1000 : limit);
        return matches.result.map(m => ({
            uuid: m,
            meta: `https://eu2.contabostorage.com/45a0651c8baa459daefd432c0307bb5b:cloud/${this.userFolder}/${m}/meta.json`,
            commands: `https://eu2.contabostorage.com/45a0651c8baa459daefd432c0307bb5b:cloud/${this.userFolder}/${m}/commands.json`,
            image: `https://eu2.contabostorage.com/45a0651c8baa459daefd432c0307bb5b:cloud/${this.userFolder}/${m}/image.png`
        }));
    }

    async removeDrawing(uuid: string) {

        await this.database.removeCloudMeta(uuid, this.palantirToken.toString());

        // remove folder from s3
        const params = {
            Bucket: this.bucketName,
            Prefix: `${this.userFolder}/${uuid}`
        };

        const command = new ListObjectsV2Command(params);
        const data = await this.client.send(command);

        if (data.Contents) {
            for (const content of data.Contents) {
                await this.client.send(new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: content.Key
                }));
            }
        }

    }

}