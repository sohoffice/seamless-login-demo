package controllers

import actors.AuthPortalActor
import akka.actor.ActorSystem
import akka.stream.Materializer
import javax.inject.Inject
import play.api.libs.streams.ActorFlow
import play.api.mvc.{AbstractController, ControllerComponents, WebSocket}

class AuthController @Inject()(
  cc: ControllerComponents
)(implicit system: ActorSystem, materialier: Materializer) extends AbstractController(cc) {

  def seamless = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      AuthPortalActor.props(out)
    }
  }
}
