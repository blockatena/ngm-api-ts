import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';

@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post("deploy-contract/")
  deployContract(@Body() deploymentDto: CreateDeploymentDto) {
    const someBody = deploymentDto;
    console.log(someBody);
  }
   
  @Post('pause-contract/:cntraddress')
  pauseContract(@Param('cntraddress') cntraddress:string){
   
  }

  
  @Post('/change-base-uri1155/cntraddr')
  changeBaseURI_1155(@Param('cntraddress') cntraddress:string){
 
  }

  
  @Get('/update-contract/:cntraddr')
  updateContract(@Param('cntraddress')cntraddress:string){
 
  }
}
