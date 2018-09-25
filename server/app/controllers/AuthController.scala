package controllers

import java.util.concurrent.TimeUnit

import actors.UserAuthActor.AuthMessage
import actors.{AuthEvents, AuthWorkerActor, UserAuthActor}
import akka.actor.{ActorRef, ActorSystem}
import akka.stream.Materializer
import javax.inject.{Inject, Named}
import play.api.libs.streams.ActorFlow
import play.api.mvc.{AbstractController, ControllerComponents, WebSocket}
import akka.util.Timeout
import org.slf4j.LoggerFactory

import scala.concurrent.ExecutionContext

class AuthController @Inject()(
  cc: ControllerComponents,
  authEventBus: AuthEvents,
  @Named("auth-worker-actor") authWorker: ActorRef
)(implicit system: ActorSystem, materialier: Materializer, ec: ExecutionContext) extends AbstractController(cc) {

  implicit val timeout = Timeout(3, TimeUnit.SECONDS)
  /**
    * Create and upgrade a websocket channel
    *
    * @return
    */
  def channel = WebSocket.accept[AuthMessage, AuthMessage] { request =>
    ActorFlow.actorRef { out =>
      UserAuthActor.props(out, authWorker, authEventBus)
    }
  }

  /**
    * An emulated endpoint to receive callback from 3rd party auth provider.
    *
    * We relay the message to authWorker and allow authWorker to notify the channel actors.
    *
    * @param handle
    * @return
    */
  def callback(handle: String) = Action { _ =>
    logger.info(s"Receive authentication callback from auth provider for $handle")
    authWorker ! AuthEvents.Authenticated(handle)
    Ok(views.html.signIn())
  }

  private val logger = LoggerFactory.getLogger(this.getClass)
}
