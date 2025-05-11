import { Db, ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import { UploadedFile } from 'express-fileupload';

export class Item {
    _id: ObjectId;
    name: string;
    description: string;
    price: number;
    images: string[];
    createdAt: Date;
    category: string;
    lastUpdated: Date;
    ownerId: ObjectId;
    location: string;
    tags: string[];
    isSold: boolean;
    boughtBy: ObjectId | null;
    isDeleted: boolean;

    constructor(item: Partial<Item>) {
        this._id = item._id!;
        this.name = item.name!;
        this.description = item.description!;
        this.price = item.price!;
        this.images = item.images || [];
        this.createdAt = item.createdAt!;
        this.category = item.category!;
        this.lastUpdated = item.lastUpdated!;
        this.ownerId = item.ownerId!;
        this.location = item.location!;
        this.tags = item.tags || [];
        this.isSold = item.isSold || false;
        this.boughtBy = item.boughtBy || null;
        this.isDeleted = item.isDeleted || false;
    }

    async save(): Promise<void> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        await db.collection('items').updateOne({ _id: this._id }, { $set: this });
    }

    private static mapToItem(item: any): Item {
        return new Item(item);
    }

    static async findById(id: string): Promise<Item | null> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        const item = await db.collection('items').findOne({ _id: new ObjectId(id) });
        return item ? this.mapToItem(item) : null;
    }

    static async findByOwnerId(ownerId: string): Promise<Item[]> {
        return this.findByField('ownerId', new ObjectId(ownerId));
    }

    static async findByCategory(category: string): Promise<Item[]> {
        return this.findByField('category', category);
    }

    static async findByTag(tag: string): Promise<Item[]> {
        return this.findByField('tags', tag);
    }

    static async getAllItems(): Promise<Item[]> {
        return this.findByField('isDeleted', false);
    }

    private static async findByField(field: string, value: any): Promise<Item[]> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        const items = await db.collection('items').find({ [field]: value }).toArray();
        return items.map(this.mapToItem);
    }

    static async create(
        name: string,
        description: string,
        price: number,
        images: UploadedFile[],
        category: string,
        tags: string[],
        ownerId: ObjectId,
        location: string
    ): Promise<{ status: boolean; message: string; item?: Item }> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');

        const validationError = this.validateItemData(name, description, price, category, tags, location);
        if (validationError) return { status: false, message: validationError };

        const item = new Item({
            _id: new ObjectId(),
            name,
            description,
            price,
            images: [],
            createdAt: new Date(),
            category,
            lastUpdated: new Date(),
            ownerId,
            location,
            tags,
            isSold: false,
            boughtBy: null,
            isDeleted: false,
        });

        await db.collection('items').insertOne(item);
        return { status: true, message: 'Item created successfully.', item };
    }

    static async deleteById(id: string): Promise<void> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');

        const item = await db.collection('items').findOne({ _id: new ObjectId(id) });
        if (!item) throw new Error('Item not found');

        await db.collection('items').updateOne({ _id: new ObjectId(id) }, { $set: { isDeleted: true } });
    }

    private static validateItemData(
        name: string,
        description: string,
        price: number,
        category: string,
        tags: string[],
        location: string
    ): string | null {
        if (!name) return 'Name is required.';
        if (!description) return 'Description is required.';
        if (price < 0) return 'Price must be greater than 0.';
        if (!category) return 'Category is required.';
        if (!tags || tags.length === 0) return 'Tags are required.';
        if (!location) return 'Location is required.';
        return null;
    }
}
