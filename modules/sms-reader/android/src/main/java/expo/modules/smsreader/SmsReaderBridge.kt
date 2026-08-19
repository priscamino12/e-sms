package expo.modules.smsreader

data class SmsMessagePayload(
  val id: String,
  val sender: String,
  val body: String,
  val receivedAt: Long
)

/**
 * [SmsReceiver] is instantiated by the OS and has no access to the Expo module registry, so it
 * cannot call `sendEvent` directly. It always persists matched messages to the durable
 * SharedPreferences queue (read by [SmsReaderModule.drainPendingMessages]), and additionally
 * notifies this bridge so a currently live module instance can forward a real-time event.
 */
object SmsReaderBridge {
  const val PREFS_NAME = "sms_reader_prefs"
  const val KEY_WATCHED_NUMBER = "watched_number"
  const val KEY_PENDING_QUEUE = "pending_queue"
  const val MESSAGE_RECEIVED_EVENT = "onMessageReceived"

  private var listener: ((SmsMessagePayload) -> Unit)? = null

  fun register(listener: (SmsMessagePayload) -> Unit) {
    this.listener = listener
  }

  fun unregister() {
    listener = null
  }

  fun notifyMessage(message: SmsMessagePayload) {
    listener?.invoke(message)
  }
}
