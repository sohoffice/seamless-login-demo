package actors

import java.time.Instant

import akka.actor.{Actor, ActorRef, Props}
import akka.event.{LogMarker, MarkerLoggingAdapter}

class AuthPortalActor(out: ActorRef) extends Actor {
  private val marker = LogMarker(name = self.path.name)
  implicit val log: MarkerLoggingAdapter = akka.event.Logging.withMarker(context.system, this.getClass)

  def receive = {
    case msg: String =>
      val now = Instant.now
      log.debug(s"Received $msg")
      out ! s"I received your message: $msg on ${now.toString}"
  }
}

object AuthPortalActor {
  def props(out: ActorRef) = Props(new AuthPortalActor(out))

}
