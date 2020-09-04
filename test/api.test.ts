import request from "supertest";
import app from "../src/app";
import Promise from "bluebird";
import logger from "../src/util/logger";
import { assert } from "console";

const testUrls: string[] = [
    "https://cn.bing.com/search?q=helloword1",
    "https://cn.bing.com/search?q=helloword2",
    "https://cn.bing.com/search?q=helloword3",
    "https://cn.bing.com/search?q=helloword4",
    "https://cn.bing.com/search?q=helloword5",
];



describe("we will create some short url then test redirect", () => {
    it("start create", (done) => {

        testUrls.forEach(function (url: string) {

            request(app).post("/api/shorturls")
                .send({"url": url})
                .expect(200, function (err, res) {
                    if(err) return done(err);

                    const data = res.body.data;
                    assert
                    logger.info("result short url", data.shortUrl);
                    if(data.rtn !== 0) return done(data.errMsg);
                    
                });
        });

    });
});