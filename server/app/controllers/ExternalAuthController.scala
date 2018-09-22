package controllers

import actors.AuthEvents
import akka.actor.ActorRef
import akka.pattern.ask
import forms.SignInData
import javax.inject.{Inject, Named}
import org.slf4j.LoggerFactory
import play.api.libs.ws.WSClient
import play.api.mvc.{AbstractController, ControllerComponents}
import play.api.routing.Router

import scala.concurrent.{ExecutionContext, Future}

class ExternalAuthController @Inject()(
  cc: ControllerComponents,
  wsClient: WSClient
)(implicit ec: ExecutionContext) extends AbstractController(cc) {

  def login(handle: String) = Action { implicit req =>
    Ok(views.html.login(handle))
  }

  def signIn = Action.async { implicit req =>
    SignInData.signInForm.bindFromRequest().fold(
      errors => {
        Future.successful(BadRequest)
      },
      data => {
        val url = routes.AuthController.callback(data.handle).absoluteURL()
        logger.info(s"Sending callback to $url")
        wsClient.url(url).post("") map { resp =>
          logger.info(s"Response $resp")
          Ok(views.html.signIn(resp.toString))
        }
      }
    )
  }

  private val logger = LoggerFactory.getLogger(this.getClass)
}
