package controllers

import javax.inject._
import org.slf4j.LoggerFactory
import play.api.libs.json.Json
import play.api.mvc._
import services.CheckInService

import scala.concurrent.ExecutionContext

/**
  * This controller creates an `Action` to handle HTTP requests to the
  * application's home page.
  */
@Singleton
class HomeController @Inject()(
  checkInService: CheckInService,
  cc: ControllerComponents
)(implicit ec: ExecutionContext) extends AbstractController(cc) {

  def getCheckIns() = Action.async { _ =>
    checkInService.get
      .map(x => Ok(Json.toJson(x)))
      .recover {
        case t: Throwable =>
          logger.warn("error getting check ins", t)
          BadRequest
      }
  }

  def checkIn(userId: Int) = Action.async { _ =>
    checkInService.checkIn(userId)
      .map(_ => Ok(Json.toJson("ok")))
      .recover {
        case t: Throwable =>
          logger.warn("error getting check ins", t)
          BadRequest
      }
  }

  private val logger = LoggerFactory.getLogger(this.getClass)
}
