package actors

import akka.actor.Actor
import javax.inject.Inject
import org.slf4j.{LoggerFactory, MarkerFactory}

class AuthWorkerActor @Inject()(
  eventBus: AuthEventBus
) extends Actor {

  // Register myself as a subscriber on the event bus. So we're notified the start / finalize events.
  eventBus.subscribe(self, "auth-event-bus")

  override def receive: Receive = {
    case AuthEventBus.Start(handle) =>
      logger.info(marker, s"Start auth flow for $handle")
    case AuthEventBus.Finalize(handle) =>
      logger.info(marker, s"Finalize auth flow for $handle")
  }


  override def postStop(): Unit = {
    // unregister myself from auth-event-bus
    eventBus.unsubscribe(self)
    super.postStop()
  }

  private val marker = MarkerFactory.getMarker(self.path.name)
  private val logger = LoggerFactory.getLogger(this.getClass)
}
