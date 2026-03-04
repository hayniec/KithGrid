import "dotenv/config";
import { getNeighbors } from "./app/actions/neighbors";

async function run() {
    const communityId = "488d50b6-1458-40bf-a417-2a1f64852410";
    const res = await getNeighbors(communityId);
    console.log(JSON.stringify(res, null, 2));
}

run().catch(console.error);
