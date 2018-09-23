package controllers

import javax.inject.Inject
import play.api.http.{DefaultHttpErrorHandler, HttpErrorHandler}
import play.api.http.Status._
import play.api.mvc.{RequestHeader, Result}
import play.api.mvc.Results._

import scala.concurrent.{ExecutionContext, Future}

class AngularClientErrorHandler @Inject()(
  defaultErrorHandler: DefaultHttpErrorHandler
)(implicit ec: ExecutionContext) extends HttpErrorHandler {
  override def onClientError(request: RequestHeader, statusCode: Int, message: String): Future[Result] = statusCode match {
    case NOT_FOUND =>
      // For asset that can't be found, redirect to index.html
      Future.successful(Redirect("/index.html"))
    case _ =>
      defaultErrorHandler.onClientError(request, statusCode, message)
  }

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = defaultErrorHandler.onServerError(request, exception)
}
