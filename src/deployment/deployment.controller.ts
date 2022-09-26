import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';

@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

 

  @Post("deploy-contract/:details")
  deployContract(@Param('details')details:object) {
    
  }
   
  @Post('pause-contract/:cntraddress')
  pauseContract(@Param('cntraddress') cntraddress:string){
   
  }

  
  @Post('/change-base-uri1155/cntraddr')
  changeBaseURI_1155(@Param('cntraddress') cntraddress:string){
 
  }

  
  @Post('/update-contract/:cntraddr')
  updateContract(@Param('cntraddress')cntraddress:string){
 
  }
}
