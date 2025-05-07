import { ObjectId } from 'mongodb';
import { getDatabase } from '../db';

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
    isDeleted: boolean;

    constructor(item: {
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
        isDeleted: boolean;
    }) {
        this._id = item._id;
        this.name = item.name;
        this.description = item.description;
        this.price = item.price;
        this.images = item.images;
        this.createdAt = item.createdAt;
        this.category = item.category;
        this.lastUpdated = item.lastUpdated;
        this.ownerId = item.ownerId;
        this.location = item.location;
        this.tags = item.tags;
        this.isSold = item.isSold;
        this.isDeleted = item.isDeleted;
    }

    async save(): Promise<void> {
        const db = getDatabase();
        await db?.collection('items').updateOne({ _id: this._id }, { $set: this });
    }

    private static mapToItem(item: any): Item {
        return new Item({
            _id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            images: item.images,
            createdAt: item.createdAt,
            category: item.category,
            lastUpdated: item.lastUpdated,
            ownerId: item.ownerId,
            location: item.location,
            tags: item.tags,
            isSold: item.isSold,
            isDeleted: item.isDeleted,
        });
    }

    static async findById(id: string): Promise<Item | null> {
        const db = getDatabase();
        const item = await db?.collection('items').findOne({ _id: new ObjectId(id) });
        return item ? this.mapToItem(item) : null;
    }

    static async findByOwnerId(ownerId: string): Promise<Item[]> {
        const db = getDatabase();
        const items = await db?.collection('items').find({ ownerId: new ObjectId(ownerId) }).toArray();
        return items ? items.map(this.mapToItem) : [];
    }

    static async findByCategory(category: string): Promise<Item[]> {
        const db = getDatabase();
        const items = await db?.collection('items').find({ category }).toArray();
        return items ? items.map(this.mapToItem) : [];
    }

    static async findByTag(tag: string): Promise<Item[]> {
        const db = getDatabase();
        const items = await db?.collection('items').find({ tags: tag }).toArray();
        return items ? items.map(this.mapToItem) : [];
    }

    static async getAllItems(): Promise<Item[]> {
        const db = getDatabase();
        const items = await db?.collection('items').find( { isDeleted: false } ).toArray();
        return items ? items.map(this.mapToItem) : [];
    }

    static async create(
        name: string,
        description: string,
        price: number,
        images: string[],
        category: string,
        tags: string[],
        location: string
    ): Promise<{ status: boolean; message: string; item?: Item }> {
        const db = getDatabase();


        if (!name) return { status: false, message: 'Name is required.' };
        if (!description) return { status: false, message: 'Description is required.' };
        if (price < 0) return { status: false, message: 'Price must be greater than 0.' };
        // if (!images || images.length === 0) return { status: false, message: 'Images are required.' };
        if (!category) return { status: false, message: 'Category is required.' };
        if (!tags || tags.length === 0) return { status: false, message: 'Tags are required.' };
        if (!location) return { status: false, message: 'Location is required.' };

        const item = new Item({
            _id: new ObjectId(),
            name,
            description,
            price,
            images,
            createdAt: new Date(),
            category,
            lastUpdated: new Date(),
            ownerId: new ObjectId(),
            location,
            tags,
            isSold: false,
            isDeleted: false,
        });

        await db?.collection('items').insertOne(item);
        return { status: true, message: 'Item created successfully.', item };
    }
}

