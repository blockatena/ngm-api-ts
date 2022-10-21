import { Buckets, PrivateKey } from '@textile/hub';
import toBuffer from 'it-to-buffer';
require('dotenv').config();

const KEY = { key: process.env.TEXTILE_KEY };
const baseUrl = process.env.TEXTILE_BUCKET_URL;

export class Bucket {
  buckets: any;
  buckKey: any;
  constructor() {
    this.buckets = null;
    this.buckKey = null;
  }

  initBuckets = async () => {
    if (this.buckets && this.buckKey) return;
    const buckets = await Buckets.withKeyInfo(KEY);
    const identity = PrivateKey.fromString(process.env.TEXTILE_USER_IDENTITY);
    await buckets.getToken(identity);
    const buck = await buckets.getOrCreate(
      process.env.TEXTILE_BUCKET_NAME || 'ngmbucket',
    );
    console.log('buck: ', buck);
    const buckKey = buck.root.key;

    this.buckets = buckets;
    this.buckKey = buckKey;
  };

  pushBlob = async (fileName, blob) => {
    await this.initBuckets();
    const file = { path: fileName, content: blob };
    await this.buckets.pushPath(this.buckKey, fileName, file);
  };

  add = async (webpage: string) => {
    await this.initBuckets();
    const file = { path: '/index.html', content: Buffer.from(webpage) };
    const raw = await this.buckets.pushPath(this.buckKey, 'index.html', file);
    console.log('raw file html upload: ', raw);
    return baseUrl + `index.html`;
  };

  pullBlob = async (fileName) => {
    await this.initBuckets();
    const buf = await toBuffer(this.buckets.pullPath(this.buckKey, fileName));
    return buf;
  };

  pushJSON = async (
    name: string,
    data: any,
    contract_address?: string,
    retry = false,
  ) => {
    try {
      console.log('pushJSON: ', name, data);
      await this.initBuckets();
      console.log('done initBuckets');
      const content = JSON.stringify(data);
      const path = contract_address
        ? `/${contract_address}/${name}.json`
        : `/${name}.json`;
      const file = { path: path, content: Buffer.from(content) };
      const res = await this.buckets.pushPath(
        this.buckKey,
        `/${name}.json`,
        file,
      );
      console.log('res of pushPath: ', res);
      return res;
    } catch (error) {
      if (!retry) {
        return this.pushJSON(name, data, contract_address, true);
      } else {
        return false;
      }
    }
  };

  pullJSON = async (name) => {
    await this.initBuckets();
    const buf = await toBuffer(
      this.buckets.pullPath(this.buckKey, `${name}.json`),
    );
    return JSON.parse(Buffer.from(buf).toString('utf-8'));
  };

  getIpnsLink = async () => {
    await this.initBuckets();
    const links = await this.buckets.links(this.buckKey);
    return links;
  };
}
