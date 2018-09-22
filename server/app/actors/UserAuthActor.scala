package actors

import java.util.UUID
import java.util.concurrent.TimeUnit

import actors.UserAuthActor.AuthCommand.AuthCommand
import akka.actor.{Actor, ActorRef, Props}
import akka.util.Timeout
import org.slf4j.{LoggerFactory, MarkerFactory}
import play.api.libs.json.{Json, Reads, Writes}

import scala.concurrent.ExecutionContext

/** The server side component to handle websocket chanel of exactly one client.
  *
  * @param out
  * @param eventBus
  * @param ec
  */
class UserAuthActor(
  out: ActorRef,
  authWorker: ActorRef,
  eventBus: AuthEvents
)(implicit ec: ExecutionContext) extends Actor {

  import UserAuthActor._

  private val logger = LoggerFactory.getLogger(this.getClass)
  private val marker = MarkerFactory.getMarker(self.path.name)

  private implicit val timeout = Timeout(3, TimeUnit.SECONDS)

  private var started = false
  private val id = UUID.randomUUID().toString
  // register myself to the event bus.
  eventBus.subscribe(self, "auth-event-bus")

  def receive = {
    case AuthMessage(cmd, _, _) if cmd == AuthCommand.HELO =>
      logger.debug(marker, "Client initiate auth flow.")
      if(!started) {
        authWorker ! AuthEvents.Start(id)
        started = true
      } else {
        logger.warn(s"Auth flow already started, ignore the request.")
      }
      out ! ACK
    case AuthMessage(cmd, _, _) if cmd == AuthCommand.AUTH =>
      out ! createHandleMessage(id)
    case AuthEvents.UserToken(handle, userId, token) if handle == id =>
      out ! createTokenMessage(token)
    case x =>
      logger.debug(marker, s"Receive unknown message of type ${x.getClass.getName}. $x")
  }

  override def aroundPostStop(): Unit = {
    logger.debug(marker, s"Stop actor $id")
    authWorker ! AuthEvents.Finalize(id)

    super.postStop()
  }
}

object UserAuthActor {
  def props(out: ActorRef, authWorker: ActorRef, eventBus: AuthEvents)(implicit ec: ExecutionContext) =
    Props(new UserAuthActor(out, authWorker, eventBus))

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

    /** Dummy message, used by the client to make sure the channel is still open.
      * Server will not respond to this command.
      *
      * - Sent by: Client
      */
    val PING = Value

    implicit def authCommandWrites(implicit w: Writes[String]): Writes[AuthCommand] = Writes[AuthCommand] { ct =>
      w.writes(ct.toString)
    }

    implicit def authCommandReads(implicit r: Reads[String]): Reads[AuthCommand] = r map { s =>
      AuthCommand.withName(s)
    }

  }

  case class AuthMessage(
    command: AuthCommand,
    handle: Option[String] = None,
    token: Option[String] = None
  )

  implicit val authMessageFormat = Json.format[AuthMessage]

  lazy val ACK = AuthMessage(AuthCommand.ACK)

  def createHandleMessage(handle: String) = AuthMessage(AuthCommand.HANDLE, handle = Some(handle))
  def createTokenMessage(token: String) = AuthMessage(AuthCommand.TOKEN, token = Some(token))

  import play.api.mvc.WebSocket.MessageFlowTransformer

  implicit val messageFlowTransformer = MessageFlowTransformer.jsonMessageFlowTransformer[AuthMessage, AuthMessage]
}
