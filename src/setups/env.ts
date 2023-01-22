import dotenv from "dotenv";

if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: ".env.prod", override: true });
} else {
    dotenv.config({ path: ".env.dev", override: true });
}
