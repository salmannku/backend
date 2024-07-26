import { isValidObjectId } from 'mongoose'
import { sendResponse } from '../../helpers/common'

import { catchAsync } from '../../utils/catchAsync'
import ResponseCodes from '../../utils/responseCodes'
import { ObjectId } from 'mongodb'
import EventLocationsModel, {
  IEventLocationsModelSchema,
} from '../../models/event-locations.model'
import DelegatesModel from '../../models/delegates.model'
import SpeakersModel from '../../models/speakers.model'
import ExhibitorsModel from '../../models/exhibitors.model'
import SponsorsModel from '../../models/sponsors.model'
import MediaPartnersModel from '../../models/media-partners.model'
import { UserServices } from '../../services/users.services'

export class EventLocationsController {
  static create = catchAsync(async (req: any, res: any) => {
    const { locations, event_id } = req.body
	//console.log("locations" , locations );
	
    if (locations?.length) {
      
     	const getUserDetailsPromises: any[] = []
	 /*	
      locations.forEach((location: IEventLocationsModelSchema) => {
        getUserDetailsPromises.push(() =>
          UserServices.getUserById({
            user_id: location?.assigned_to,
          })
        )
      })
      */
      
      
      const users = await Promise.all(
        getUserDetailsPromises.map((_func) => _func())
      )
      
      
      const createResponse = await EventLocationsModel.insertMany(
        locations.map((location: IEventLocationsModelSchema, index: any) => {
          if (!location?.assigned_to) {
            return {
              event_id,
              location_name: location?.location_name,
            }
          }
          var selectedAllUserDetails = JSON.parse(location?.assigned_to);
          var delegatesIds = [];
	      var speakersIds = [];
	      var exhibitorsIds = [];
	      var sponsorsIds = [];
	      var media_partnersIds = [];
		  var selectedAllUserIds = selectedAllUserDetails.map(obj => obj.id);
		  selectedAllUserDetails.map( (selectedAllUserDetail) => {
      	 	if(selectedAllUserDetail.user_type == 'delegate' ){
      	 		delegatesIds.push(selectedAllUserDetail.id)
      	 	}else if(selectedAllUserDetail.user_type == 'speaker' ){
      	 		speakersIds.push(selectedAllUserDetail.id)
      	 	} else if(selectedAllUserDetail.user_type == 'exhibitor' ){
      	 		exhibitorsIds.push(selectedAllUserDetail.id)
      	 	}  else if(selectedAllUserDetail.user_type == 'sponsor' ){
      	 		sponsorsIds.push(selectedAllUserDetail.id)
      	 	} else if(selectedAllUserDetail.user_type == 'media partner' ){
      	 		media_partnersIds.push(selectedAllUserDetail.id)
      	 	} 
      	 });
      	 
      	// console.log("assigned_to_multiple_ids" , selectedAllUserIds );
    //console.log("delegatesIds" , delegatesIds );
    //console.log("speakersIds" , speakersIds );
   // console.log("exhibitorsIds" , exhibitorsIds );
   // console.log("sponsorsIds" , sponsorsIds );
    //console.log("media_partnersIds" , media_partnersIds );
      	 
          return {
            event_id,
            location_name: location?.location_name,
            assigned_to_multiple_ids: selectedAllUserIds,
            assigned_to_delegates: delegatesIds,
            assigned_to_speakers: speakersIds,
            assigned_to_exhibitors: exhibitorsIds,
            assigned_to_sponsors: sponsorsIds,
            assigned_to_media_partners: media_partnersIds,
            //assigned_to: location?.assigned_to ?? null,
            //assigned_to_name: users?.[index]?.username ?? '',
            //user_type: users?.[index]?.user_type ?? '',
          }
        })
      )

      return sendResponse({
        res,
        success: true,
        message: 'Event locations are added successfully',
        response_code: ResponseCodes.CREATE_SUCCESS,
      })
    }

    return sendResponse({
      res,
      success: true,
      message: 'Event locations are added successfully',
      response_code: ResponseCodes.CREATE_SUCCESS,
    })
  })

  static getLocations = catchAsync(async (req: any, res: any) => {
    const eventId = req?.params?.event_id
    //console.log("eventId" , eventId );

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      assignee_id = '',
      created_at = '',
    } = req.query

    let query: Record<any, any> = {}

    if (isValidObjectId(search)) {
      query = {
        $or: [
          { _id: new ObjectId(search) },
          { location_name: { $regex: search, $options: 'i' } },
          { location_code: { $regex: search, $options: 'i' } },
        ],
      }
    } else if (search) {
      query = {
        $or: [
          { location_name: { $regex: search, $options: 'i' } },
          { location_code: { $regex: search, $options: 'i' } },
        ],
      }
    }

    if (status) {
      query.status = status
    }

    

    let locationsForUserCounts = 0
	//console.log("userinfo" , req.user );
	var loggedUserId = req.user?._id;
	//console.log("loggedUserId" , loggedUserId );
	
	
	
    if (assignee_id) {
    	if( loggedUserId ){
			query = {
		        $or: [
		          { assigned_to_multiple_ids: new ObjectId(loggedUserId) },
		          { assigned_to_multiple_ids: new ObjectId(assignee_id) },
		          { assigned_to_multiple_ids: { $size: 0 } }
		        ],
			}
		} else {
			query = {
		        $or: [
		          { assigned_to_multiple_ids: new ObjectId(assignee_id) },
		          { assigned_to_multiple_ids: { $size: 0 } }
		        ],
			}
		}
    	query.event_id = new ObjectId(eventId)
		//console.log('Query:', JSON.stringify(query, null, 2));
        ///query.assigned_to = new ObjectId(assignee_id)
		locationsForUserCounts = await EventLocationsModel.find(query).count()
    }
	query.event_id = new ObjectId(eventId)
    const options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: created_at },
    }

    if (!locationsForUserCounts || locationsForUserCounts == 0) {
      delete query.assigned_to
    }
	
	/*
    const locations = await (EventLocationsModel as any).paginate(
      query,
      options,
    )
    */
    
    const locations = await (EventLocationsModel as any).paginate(query, {
            ...options,
            populate: [
	            {  path: 'assigned_to_delegates', select: '_id first_name last_name' },
	            {  path: 'assigned_to_speakers', select: '_id first_name last_name' },
	            {  path: 'assigned_to_exhibitors', select: '_id first_name last_name' },
	            {  path: 'assigned_to_sponsors', select: '_id sponsor_name' },
	            {  path: 'assigned_to_media_partners', select: '_id first_name last_name' },
            ]
        });
    
    locations.docs.map( (location) => {
            //console.log(`Location: ${location.location_name}`);
           // console.log("location"  , location );
           var all_assign_user_name = [];
           var all_user_json_info = [];
           if( location?.assigned_to_delegates ){
            	location.assigned_to_delegates.forEach(delegate => {
	            	all_assign_user_name.push( delegate.first_name + " " + delegate.last_name );
	            	var row_json_info = { 'name' : delegate.first_name + " " + delegate.last_name , 'id' : delegate._id , 'type' : 'delegate'  };
	            	all_user_json_info.push(row_json_info);
	            });
            }
            if( location?.assigned_to_speakers ){
            	location.assigned_to_speakers.forEach(speaker => {
	            	all_assign_user_name.push( speaker.first_name + " " + speaker.last_name );
	            	var row_json_info = { 'name' : speaker.first_name + " " + speaker.last_name , 'id' : speaker._id , 'type' : 'speaker'  };
	            	all_user_json_info.push(row_json_info);
	            });
            }
            if( location?.assigned_to_exhibitors ){
            	location.assigned_to_exhibitors.forEach(exhibitor => {
	            	all_assign_user_name.push( exhibitor.first_name + " " + exhibitor.last_name );
	            	var row_json_info = { 'name' : exhibitor.first_name + " " + exhibitor.last_name , 'id' : exhibitor._id , 'type' : 'exhibitor'  };
	            	all_user_json_info.push(row_json_info);
	            });
            }
            if( location?.assigned_to_sponsors ){
            	location.assigned_to_sponsors.forEach(sponsor => {
            	console.log("sponsor" , sponsor );
	            	all_assign_user_name.push( sponsor.sponsor_name );
	            	var row_json_info = { 'name' : sponsor.sponsor_name  , 'id' : sponsor._id , 'type' : 'sponsor'  };
	            	all_user_json_info.push(row_json_info);
	            });
            }
            if( location?.assigned_to_media_partners ){
            	location.assigned_to_media_partners.forEach(media_partner => {
	            	all_assign_user_name.push( media_partner.first_name + " " + media_partner.last_name );
	            	var row_json_info = { 'name' : media_partner.first_name + " " + media_partner.last_name , 'id' : media_partner._id ,  'type' : 'media partner'   };
	            	all_user_json_info.push(row_json_info);
	            });
            }
            location.assigned_to_name = all_assign_user_name.join(', ');
            location.assigned_to_user_info = all_user_json_info;
            //console.log("all_assign_user_name" , all_assign_user_name );
        });

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.GET_SUCCESS,
      data: locations,
    })
  })

  static update = catchAsync(async (req: any, res: any) => {
    const locationId = req?.params?.location_id

    const { location_name, assigned_to } = req.body

    const locationRecord = await EventLocationsModel.findByIdAndUpdate(
      locationId,
      {},
      {
        new: true,
      }
    )

    if (!locationRecord) {
      return sendResponse({
        res,
        success: false,
        message: 'Event location not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }
    
	/*
    if (
      assigned_to &&
      locationRecord?.assigned_to?.toString() != assigned_to.trim()
    ) {
      const userRes = await UserServices.getUserById({
        user_id: assigned_to?.trim(),
      })

      locationRecord.assigned_to_name = userRes.username
    }
    */
    
    var delegatesIds = [];
  	var speakersIds = [];
  	var exhibitorsIds = [];
  	var sponsorsIds = [];
  	var media_partnersIds = [];
  	var selectedAllUserIds = [];
    if( assigned_to ){
    	var selectedAllUserDetails = JSON.parse(assigned_to);
    	console.log("selectedAllUserDetails" , selectedAllUserDetails );
    	selectedAllUserIds = selectedAllUserDetails.map(obj => obj.id);
    	selectedAllUserDetails.map( (selectedAllUserDetail) => {
		 	if(selectedAllUserDetail.user_type == 'delegate' ){
		 		delegatesIds.push(selectedAllUserDetail.id)
		 	}else if(selectedAllUserDetail.user_type == 'speaker' ){
		 		speakersIds.push(selectedAllUserDetail.id)
		 	} else if(selectedAllUserDetail.user_type == 'exhibitor' ){
		 		exhibitorsIds.push(selectedAllUserDetail.id)
		 	}  else if(selectedAllUserDetail.user_type == 'sponsor' ){
		 		sponsorsIds.push(selectedAllUserDetail.id)
		 	} else if(selectedAllUserDetail.user_type == 'media partner' ){
		 		media_partnersIds.push(selectedAllUserDetail.id)
		 	} 
		 });
    }
    /*
    console.log("assigned_to_multiple_ids" , selectedAllUserIds );
    console.log("delegatesIds" , delegatesIds );
    console.log("speakersIds" , speakersIds );
    console.log("exhibitorsIds" , exhibitorsIds );
    console.log("sponsorsIds" , sponsorsIds );
    console.log("media_partnersIds" , media_partnersIds );
    return false;
    */
	locationRecord.assigned_to_multiple_ids = selectedAllUserIds;
	locationRecord.assigned_to_delegates = delegatesIds;
	locationRecord.assigned_to_speakers = speakersIds;
	locationRecord.assigned_to_exhibitors = exhibitorsIds;
	locationRecord.assigned_to_sponsors = sponsorsIds;
	locationRecord.assigned_to_media_partners = media_partnersIds;
    if (location_name) locationRecord.location_name = location_name
    
    /*
    if (assigned_to) locationRecord.assigned_to = assigned_to
    if (!assigned_to) {
      ;(locationRecord as any).assigned_to = null
      locationRecord.assigned_to_name = ''
    }
	*/
    
    await locationRecord.save()

    return sendResponse({
      res,
      success: true,
      message: 'Event location updated successfully',
      response_code: ResponseCodes.UPDATE_SUCCESS,
      data: null,
    })
  })

  static delete = catchAsync(async (req: any, res: any) => {
    const locationId = req?.params?.location_id

    const deleteResponse = await EventLocationsModel.findByIdAndDelete(
      locationId
    )

    if (!deleteResponse) {
      return sendResponse({
        res,
        success: false,
        message: 'Event location not found!',
        response_code: ResponseCodes.NOT_FOUND,
      })
    }

    return sendResponse({
      res,
      success: true,
      response_code: ResponseCodes.DELETE_SUCCESS,
    })
  })
}
