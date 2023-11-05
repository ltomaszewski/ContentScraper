import express from "express";
import { ContentService } from "../ContentService";

export class ContentRESTService {
    private contentService: ContentService

    constructor(contentService: ContentService) {
        this.contentService = contentService;
    }

    installEndpoints(basePath: string, app: express.Application) {
        app.get(basePath + "/content/all", async (req, res) => {
            const contentLinkConfigurations = await this.contentService.getAll();
            res.json(contentLinkConfigurations);
        });
    }
}