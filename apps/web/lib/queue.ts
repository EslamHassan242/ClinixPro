import { Queue, Worker, Job } from "bullmq";
import { redis } from "./redis";

// Define the connection
const connection = redis;

// Initialize the main background queue
export const backgroundQueue = new Queue("background-tasks", {
    connection: redis as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
    },
});

/**
 * Job processor for the background queue
 */
export const backgroundWorker = new Worker(
    "background-tasks",
    async (job: Job) => {
        const { type, data } = job.data;

        console.log(`Processing job ${job.id} of type ${type}`);

        switch (type) {
            case "SEND_NOTIFICATION":
                // TODO: Integrate with Notification Service (E4)
                console.log("Sending notification:", data);
                break;
            case "CALCULATE_ANALYTICS":
                // TODO: Perform deep analytics (E3)
                console.log("Calculating analytics for tenant:", data.tenantId);
                break;
            default:
                console.warn(`Unknown job type: ${type}`);
        }
    },
    { connection: redis as any, concurrency: 5 }
);

backgroundWorker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed!`);
});

backgroundWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});
