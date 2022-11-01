import { Controller, Logger } from '@nestjs/common';

import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Controller('cron-jobs')
export class CronJobsController {
  private readonly logger = new Logger(CronJobsController.name);
  constructor(
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  addCornJob(name: string, date: string, callback: any) {
    console.log('date', date);
    const job = new CronJob(new Date(date), callback);
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