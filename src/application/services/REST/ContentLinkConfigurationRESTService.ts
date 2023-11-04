import express from "express";
import { ContentLinkConfigurationService } from "../ContentLinkConfigurationService";
import { ContentLinkConfigurationDTO } from "../../dtos/ContentLinkConfigurationDTO";

export class ContentLinkConfigurationRESTService {
    private contentLinkConfigurationService: ContentLinkConfigurationService

    constructor(contentLinkConfigurationService: ContentLinkConfigurationService) {
        this.contentLinkConfigurationService = contentLinkConfigurationService;
    }


    installEndpoints(basePath: string, app: express.Application) {
        // Add a source to the database
        app.post(basePath + "/contentLinkConfiguration/add", async (req, res) => {
            try {
                const sourceDTO = ContentLinkConfigurationDTO.createFromObject(req.body);
                const result = await this.contentLinkConfigurationService.insert(sourceDTO);
                res.status(201).json(result);
            } catch (error: any) {
                res.status(400).json({ error: error.message });
            }
        });

        // Remove a source from the database
        app.delete(basePath + "/contentLinkConfiguration/delete/:id", async (req, res) => {
            const id = parseInt(req.params.id, 10);
            if (!id) {
                return res.status(400).json({ message: "Missing required fields." });
            }

            try {
                const removedSource = await this.contentLinkConfigurationService.delete(id)
                res.sendStatus(204);
            } catch (error: any) {
                res.status(400).json({ error: error.message });
            }
        });

        // List all sources in the database
        app.get(basePath + "/contentLinkConfiguration/all", async (req, res) => {
            const contentLinkConfigurations = await this.contentLinkConfigurationService.getAll();
            res.json(contentLinkConfigurations);
        });
    }

}