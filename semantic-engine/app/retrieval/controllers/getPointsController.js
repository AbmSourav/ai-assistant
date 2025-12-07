import ollama from 'ollama'
import { v4 as uuid } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

const getPointsController = async (req, res) => {
    const ids = req?.query?.ids.split(',').map(id => id.trim());
    res.json({ message: 'Get Points Controller is working...', data: ids });

    // try {
    //     const result = await qdrantClient.retrieve("assistant", {
    //         ids: [1],
    //         with_payload: true,
    //         with_vector: true,
    //     });
    //     res.json({ message: 'Index route is working', queryResult: result });
    // } catch (error) {
    //     console.error('Error querying Qdrant:', error);
    //     res.status(500).json({
    //         status: 'Error',
    //         message: error.message,
    //         details: error.toString()
    //     });
    // }
}

export default getPointsController;
