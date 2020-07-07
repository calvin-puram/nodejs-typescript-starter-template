import * as request from "supertest";
import App from "../app";
import IndexRoute from "../routes/index.routes";

afterAll(async () => {
  await new Promise((resolve) => setTimeout(() => resolve(), 500));
});

describe("[GET] /", () => {
  it("should response with statusCode of 200", () => {
    const indexRoute = new IndexRoute();
    const app = new App([indexRoute]);
    return request(app.getServer()).get(`${indexRoute.path}`).expect(200);
  });
});
