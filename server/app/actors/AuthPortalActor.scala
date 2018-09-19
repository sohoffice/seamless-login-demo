package actors

import akka.actor.{Actor, ActorRef, Props}
import akka.event.{LogMarker, MarkerLoggingAdapter}

class AuthPortalActor(out: ActorRef) extends Actor {
  private val marker = LogMarker(name = self.path.name)
  implicit val log: MarkerLoggingAdapter = akka.event.Logging.withMarker(context.system, this.getClass)

  def receive = {
    case msg: String =>
      out ! ("I received your message: " + msg)
  }
}

object AuthPortalActor {
  def props(out: ActorRef) = Props(new AuthPortalActor(out))

}
