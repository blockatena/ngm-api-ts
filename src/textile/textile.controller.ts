import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Bucket } from './helper/textileHelper';
import { TextileService } from './textile.service';

@ApiTags('Textile')
@Controller('textile')
export class TextileController {
  constructor(private readonly textileService: TextileService) {}

  // Swagger UI Options
  @ApiOperation({
    summary:
      'This api is a demonstration for storing files in a json format while keeping the base link same',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched Textile',
  })
  @ApiResponse({
    status: 400,
    description: 'there  is no textile assocaited with given Id',
  })
  /**************************** */
  // Actual Get Route
  @Get('/')
  async runTextileBucket(): Promise<string> {
    try {
      const buckInstance = new Bucket();
      console.log('buckInstance Created: ', buckInstance);
      const jsonData = {
        name: 'Azuki #2',
        image:
          'https://ikzttp.mypinata.cloud/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/2.png',
        attributes: [
          {
            trait_type: 'Type',
            value: 'Human',
          },
          {
            trait_type: 'Hair',
            value: 'Water',
          },
          {
            trait_type: 'Clothing',
            value: 'Pink Oversized Kimono',
          },
          {
            trait_type: 'Eyes',
            value: 'Striking',
          },
          {
            trait_type: 'Mouth',
            value: 'Frown',
          },
          {
            trait_type: 'Offhand',
            value: 'Monkey King Staff',
          },
          {
            trait_type: 'Background',
            value: 'Off White A',
          },
        ],
      };
      const response = await buckInstance.pushJSON('2', jsonData);
      console.log("Json pushed response: ", response);
      // const htmlData = `
      // <!DOCTYPE html>
      // <html lang="en">
      // <head>
      //     <meta charset="UTF-8">
      //     <meta http-equiv="X-UA-Compatible" content="IE=edge">
      //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //     <title>Document</title>
      // </head>
      // <body>
      //     This is the textile for NFT Game Machine
      // </body>
      // </html>`;
      // const response = await buckInstance.add(htmlData);
      const ipnsLink = await buckInstance.getIpnsLink();
      console.log('ipnsLink: ', ipnsLink);
      return ipnsLink;
    } catch (error) {
      console.log(error);
    }
  }
}
