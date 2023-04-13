import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
// @Cron('*/10 * * * * *')
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  addCornJob(name: string, date: string, callback: any) {
    // console.log('date', date);
    const utcdate = Math.floor(new Date(date).getTime() / 1000);
    // console.log('utc date:', utcdate);
    const job = new CronJob(utcdate.toString(), callback);
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.warn(`job ${name} added for each minute at ${date} seconds!`);
  }
  deleteCron(name: string) {
    try {
      console.log(name);
      const job = this.getCrons();
      console.log(job);
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.warn(`job ${name} deleted!`);
    } catch (err) {
      console.log(err);
    }
  }
  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    let arr = [];
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      arr.push(`job: ${key} next: ${next}`);
    });
    return arr;
  }
}
