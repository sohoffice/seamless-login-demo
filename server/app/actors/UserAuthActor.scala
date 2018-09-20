package actors

import java.util.UUID
import java.util.concurrent.TimeUnit

import actors.UserAuthActor.AuthCommand.AuthCommand
import akka.actor.{Actor, ActorRef, Props}
import akka.util.Timeout
import org.slf4j.{LoggerFactory, MarkerFactory}
import play.api.libs.json.{Json, Reads, Writes}

import scala.concurrent.ExecutionContext

class UserAuthActor(
  out: ActorRef,
  eventBus: AuthEventBus
)(implicit ec: ExecutionContext) extends Actor {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val marker = MarkerFactory.getMarker(self.path.name)

  private implicit val timeout = Timeout(3, TimeUnit.SECONDS)

  private var started = false
  private val id = UUID.randomUUID().toString
  // register myself to the event bus.
  eventBus.subscribe(self, "auth-event-bus")

  def receive = {
    case msg: String =>
      logger.debug(marker, s"Received $msg for actor $id")
      if(!started) {
        eventBus.publish(AuthEventBus.Start(id))
        started = true
      }
    case _: AuthEventBus.Start =>
      out ! "start authentication"
    case _: AuthEventBus.Authenticated =>
      out ! "authenticated"
    case x =>
      logger.warn(marker, s"Receive unknown message of type ${x.getClass.getName}. $x")
  }

  override def aroundPostStop(): Unit = {
    logger.debug(marker, s"Stop actor $id")
    out ! "finalized"
    eventBus.publish(AuthEventBus.Finalize(id))

    super.postStop()
  }
}

object UserAuthActor {
  def props(out: ActorRef, eventBus: AuthEventBus)(implicit ec: ExecutionContext) = Props(new UserAuthActor(out, eventBus))

  object AuthCommand extends Enumeration {
    type AuthCommand = Value

    /** Initiate the authentication process.
      *
      * - Sent by: Client
      *
      * Example:
      *
      * {{{
      *   {
      *     command: "HELO"
      *   }
      * }}}
      */
    val HELO = Value

    /** General purpose acknowledge message.
      *
      * - Sent by: Client
      *
      * Example:
      *
      * {{{
      *   {
      *     command: "ACK"
      *   }
      * }}}
      */
    val ACK = Value

    /** Request an auth handle.
      *
      * - Sent by: Client
      *
      * Example:
      *
      * {{{
      *   {
      *     command: "AUTH"
      *   }
      * }}}
      */
    val AUTH = Value

    /** Server respond the handle. Client should use this handle to open authentication screen.
      *
      * - Sent by: Server
      *
      * Example:
      *
      * {{{
      *   {
      *     command: "HANDLE", handle: "some-handle-to-uniquely-identify-this-client"
      *   }
      * }}}
      */
    val HANDLE = Value

    /** Server finish the authentication process with 3rd party provider. Local access token was granted.
      * Client can continue to use the application with this token.
      *
      * Do not confuse this token with the one provided by 3rd party auth provider.
      * The client should only knows the local token.
      *
      * - Sent by: Server
      *
      * Example:
      *
      * {{{
      *   {
      *     command: "TOKEN", token: {
      *       accessToken: some-token,
      *       expiresIn: 3600
      *       ...
      *     }
      *   }
      * }}}
      *
      */
    val TOKEN = Value
    val PING = Value

    implicit def authCommandWrites(implicit w: Writes[String]): Writes[AuthCommand] = Writes[AuthCommand] { ct =>
      w.writes(ct.toString)
    }

    implicit def authCommandReads(implicit r: Reads[String]): Reads[AuthCommand] = r map { s =>
      AuthCommand.withName(s)
    }

  }

  case class SimpleAuthMessage(
    command: AuthCommand
  )

  implicit val authMessageFormat = Json.format[SimpleAuthMessage]

  case class HandleAuthMessage(
    command: AuthCommand,
    handle: String
  )

  implicit val handleAuthMessageFormat = Json.format[HandleAuthMessage]

  case class TokenAuthMessage(
    command: AuthCommand,
    token: String
  )

  implicit val tokenAuthMessageFormat = Json.format[TokenAuthMessage]

}
