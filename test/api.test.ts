import request, { SuperTest, Test } from "supertest";
import app from "../src/app";
import BluebirdPromise from "bluebird";
import _ from "lodash";
import { assert } from "console";
import { ResponseObject, ErrorCode } from "../src/models/Common";
import { IShortURL } from "../src/models/ShortUrl";


const urlSize = 50;
const createTimeout: number = 50 * 1000;
const retriveTimeout: number = 50 * 1000;
const requestTimeout: number = 5 * 1000;
const maxConcurrency = 5;
const baseTestUrl = "https://cn.bing.com/search?q=";


describe("we will create some short url then test redirect", () => {

    let longUrls: string[] = [],
        shortUrls: string[] = [],
        redirectUrls: string[] = [];

    const req: SuperTest<Test> = request(app);

    it("create a large set of long url for test", (done) => {
        longUrls = _.range(0, urlSize).map((u: number) => `${baseTestUrl}${u + Math.random()}`);
        done();
    });


    it("start create short urls ", async (done) => {

        function getOneShortUrl(url: string, index: number): Promise<string> {

            const result = req.post("/api/shorturls").timeout({ deadline: requestTimeout })
                .send({ "url": url })
                .expect(200)
                .then((res) => {
                    //assert(res.body.rtn, 0);
                    //console.log(res.body);;
                    const s: string = res.body && res.body.data && res.body.data.shortUrl;
                    console.log("api return result %s, %d/%d", s, index, urlSize);
                    return s;
                });


            console.log("api return result %s, %d/%d", url, index, urlSize);
            return Promise.resolve(result);

        }

        const urlList: string[] = await BluebirdPromise.map(longUrls, getOneShortUrl, { concurrency: maxConcurrency });

        console.log(`generate ${urlList.length} short urls`);
        shortUrls = urlList;

        done();
    }, createTimeout);

    it("redirect by shortUrl", async (done) => {

        console.log("redirect %d shortUrls", shortUrls.length);

        async function getOneLongUrl(url: string, index: number): Promise<string> {

            console.log("redirect short url: %s %d/%d", url, index, urlSize);

            const result = await request(url).get("")
                .timeout({ deadline: requestTimeout })
                .redirects(0)
                .expect(302)
                .then((res) => {
                    const lUrl: string = res && res.header && res.header.location;
                    console.log("redirect %s to %s", url, lUrl);
                    assert(longUrls[index] == lUrl);
                    return lUrl;
                });

            //console.log("get long url result", result);
            return result;

        }

        redirectUrls = await BluebirdPromise.map(shortUrls, getOneLongUrl, { concurrency: maxConcurrency });

        console.log(`retrieve ${redirectUrls.length} urls`);
        done();

    }, retriveTimeout);


    it("create a bad format shortUrl", async (done) => {

        await req.post("/api/shorturls").timeout({ deadline: requestTimeout })
            .send({ "url": "hello,world" })
            .expect(200)
            .then((res) => {
                const resObj: ResponseObject = res.body;
                assert(resObj.rtn == ErrorCode.ERROR_INVALID_PARAM);
            });

        done();
    });

    it("should create same short url", async (done) => {

        const testUrl: string = baseTestUrl + Math.random();
        const testUrlList: string[] = [testUrl, testUrl];

        const resultList: string[] = await BluebirdPromise.mapSeries(testUrlList, function (testUrl: string): Promise<string> {

            return req.post("/api/shorturls").timeout({ deadline: requestTimeout })
                .send({ "url": testUrl })
                .expect(200)
                .then((res) => {
                    const resObj: ResponseObject = res.body;
                    const shortObj: IShortURL = resObj.data as IShortURL;
                    return shortObj.shortUrl;
                });

        });

        assert(resultList[0] == resultList[1], "should be the same");


        done();
    });
});