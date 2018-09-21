package controllers

import java.util.concurrent.TimeUnit

import actors.UserAuthActor.AuthMessage
import actors.{AuthEventBus, AuthWorkerActor, UserAuthActor}
import akka.actor.{ActorRef, ActorSystem}
import akka.stream.Materializer
import javax.inject.{Inject, Named}
import play.api.libs.streams.ActorFlow
import play.api.mvc.{AbstractController, ControllerComponents, WebSocket}
import akka.util.Timeout

import scala.concurrent.ExecutionContext

class AuthController @Inject()(
  cc: ControllerComponents,
  authEventBus: AuthEventBus,
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
      UserAuthActor.props(out, authEventBus)
    }
  }

  /**
    * An emulated endpoint to receive callback from 3rd party auth provider.
    *
    * We relay the message to authWorker and allow authWorker to notify the channel actors.
    *
    * @param id
    * @return
    */
  def callback(id: String) = Action { _ =>
    authEventBus.publish(AuthEventBus.Authenticated(id))
    Ok("ok")
  }
}
