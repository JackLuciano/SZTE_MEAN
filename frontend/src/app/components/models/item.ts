import { categories } from "../../data/categories";
import { Category } from "./categories";

export class Item {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    createdAt: Date;
    category!: Category;
    lastUpdated: Date;
    ownerId: string;
    location: string;
    tags: string[];
    isSold: boolean;
    isDeleted: boolean;

    constructor(item: {
        _id: string;
        name: string;
        description: string;
        price: number;
        images: string[];
        createdAt: Date;
        category: Category | string;
        lastUpdated: Date;
        ownerId: string;
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

        if (typeof item.category === 'string') {
            let found : boolean = false;
            categories.forEach((category) => {
                if (category.slug === item.category) {
                    this.category = category;

                    found = true;
                    return;
                }
            });

            if (!found)
                this.category = categories[0];
        } else
            this.category = item.category;

        this.lastUpdated = item.lastUpdated;
        this.ownerId = item.ownerId;
        this.location = item.location;
        this.tags = item.tags;
        this.isSold = item.isSold;
        this.isDeleted = item.isDeleted;
    }
}