package controllers

import forms.SignInData
import javax.inject.Inject
import org.slf4j.LoggerFactory
import play.api.libs.ws.WSClient
import play.api.mvc.{AbstractController, ControllerComponents}

import scala.concurrent.ExecutionContext

class ExternalAuthController @Inject()(
  cc: ControllerComponents,
  wsClient: WSClient
)(implicit ec: ExecutionContext) extends AbstractController(cc) {

  def login(handle: String) = Action { implicit req =>
    Ok(views.html.login(handle))
  }

  def signIn = Action { implicit req =>
    SignInData.signInForm.bindFromRequest().fold(
      errors => {
        BadRequest
      },
      data => {
        Redirect(routes.AuthController.callback(data.handle))
      }
    )
  }

  private val logger = LoggerFactory.getLogger(this.getClass)
}
