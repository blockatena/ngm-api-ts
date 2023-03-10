import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NftMarketplaceService } from './marketplace.service';
import { ActivityService } from 'src/activity/activity.service';
import { G2W3_1155Sale, G2W3_1155Offer, G2W3_1155AcceptOffer, G2W3_1155CancelSale, G2W3_1155CancelOffer, G2W3_1155AllOffers } from './dtos/auctiondto/create-1155-auction.dto';
import { NftService } from '../nft/nft.service';
@ApiTags('MarketPlace 1155')
@Controller('nft-marketplace')
export class NftMarketplace1155Controller {
  constructor(
    private readonly nftMarketplaceService: NftMarketplaceService,
  ) { }

  /*********************[ERC1155 PART]***********************/

  /*********************[CREATE SALE]***********************/

  @ApiOperation({ summary: 'Create Sale' })
  @ApiResponse({
    status: 201,
    description: 'Create Sale 1155',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  @Post('create-sale-1155')
  async createSale1155(@Body() body: G2W3_1155Sale) {
    try {
      return await this.nftMarketplaceService.create1155sale(body);
    } catch (e) {
      return {
        success: 'error',
        message: e
      }
    }
  }

  // @ApiOperation({ summary: 'Update Sale' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Update Sale 1155',
  // })
  // @ApiResponse({ status: 400, description: 'Something went wrong' })
  // @Post('update-sale-1155')
  async updateSale1155(@Body() body: G2W3_1155Sale) {
    try {
      return await this.nftMarketplaceService.update1155sale(body);
    } catch (e) {
      return {
        success: 'error',
        message: e
      }
    }
  }
  @ApiOperation({ summary: 'Cancel Sale' })
  @ApiResponse({
    status: 201,
    description: 'Cancel Sale 1155',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  @Post('cancel-sale-1155')
  async cancelSale1155(@Body() body: G2W3_1155CancelSale) {
    try {
      return await this.nftMarketplaceService.cancel1155sale(body);
    } catch (e) {
      return {
        success: 'error',
        message: e
      }
    }
  }

  @ApiOperation({ summary: 'Make Offer ' })
  @ApiResponse({
    status: 201,
    description: 'Make offer 1155',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  @Post('make-offer-1155')
  async makeOffer1155(@Body() body: G2W3_1155Offer) {
    try {
      return await this.nftMarketplaceService.make1155offer(body);
    } catch (e) {
      return {
        success: 'error',
        message: e
      }
    }
  }

  @ApiOperation({ summary: 'Accept Offer ' })
  @ApiResponse({
    status: 201,
    description: 'Accept offer 1155',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  @Post('accept-offer-1155')
  async acceptOffer1155(@Body() body: G2W3_1155AcceptOffer) {
    try {
      return await this.nftMarketplaceService.accept1155offer(body);
    } catch (e) {
      return {
        success: 'error',
        message: e
      }
    }
  }

  @ApiOperation({ summary: 'Cancel Offer ' })
  @ApiResponse({
    status: 201,
    description: 'Cancel offer 1155',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  @Post('cancel-offer-1155')
  async cancelOffer1155(@Body() body: G2W3_1155CancelOffer) {
    try {
      return await this.nftMarketplaceService.cancel1155offer(body);
    } catch (e) {
      return {
        success: 'error',
        message: e
      }
    }
  }

  @ApiOperation({ summary: 'Get All Offer ' })
  @ApiResponse({
    status: 201,
    description: 'Get All offer 1155',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  @Post('get-all-offer-1155')
  async getAllOffer1155(@Body() body: G2W3_1155AllOffers) {
    try {
      return await this.nftMarketplaceService.getAll1155offer({ body, status: 'started' });
    } catch (e) {
      return {
        success: 'error',
        message: e
      }
    }
  }
}
