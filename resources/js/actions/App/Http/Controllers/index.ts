import AdController from './AdController'
import AdReportController from './AdReportController'
import DealController from './DealController'
import DealReviewController from './DealReviewController'
import ConversationController from './ConversationController'
import MessageController from './MessageController'
import AdImageController from './AdImageController'
import ProfileController from './ProfileController'
import Auth from './Auth'

const Controllers = {
    AdController: Object.assign(AdController, AdController),
    AdReportController: Object.assign(AdReportController, AdReportController),
    DealController: Object.assign(DealController, DealController),
    DealReviewController: Object.assign(DealReviewController, DealReviewController),
    ConversationController: Object.assign(ConversationController, ConversationController),
    MessageController: Object.assign(MessageController, MessageController),
    AdImageController: Object.assign(AdImageController, AdImageController),
    ProfileController: Object.assign(ProfileController, ProfileController),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers
