import { Body, Controller, Get, Param, Post} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { signup } from "./items/signup.dto";
import { signin } from "./items/signin.dto";
import { getinfo } from "./items/getinfo.dto";
import { getname } from "./items/getname.dto";

//Global
@Controller('auth')
export class AuthController {
    constructor(private authservice:AuthService){

    }

//  Post route
    @Post('signup')
    signup(@Body()Signup :signup): string{
          
        return   `Hello ${Signup.name}  you are successfully registered`;
    }

//  Post route
    @Post('login')
    signin(@Body() Signin:signin){
      return  `Hello ${Signin.name} You are Successfully logged in  `   ;
    }

// get Route
    @Get(':id')
        readitems(@Param() Getinfo:getinfo): string{
            console.log(Getinfo.id);
            return `your id is ${Getinfo.id}`;
        }

//   Get route
    @Get(':id/:name')
    readall(@Param() Getname:getname): string{
    return `your id is ${Getname.id} and your name is  ${Getname.name}`;
    }
}