package expo.modules.smsreader

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

/**
 * Manifest-registered receiver (see this module's AndroidManifest.xml) so it keeps firing on
 * `SMS_RECEIVED` even when the app process has been killed, as long as the user hasn't force-
 * stopped the app. Must have a no-arg constructor: the OS instantiates it, not Expo's module
 * registry.
 */
class SmsReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

    val prefs = context.getSharedPreferences(SmsReaderBridge.PREFS_NAME, Context.MODE_PRIVATE)
    val watchedNumber = prefs.getString(SmsReaderBridge.KEY_WATCHED_NUMBER, null) ?: return

    val parts = Telephony.Sms.Intents.getMessagesFromIntent(intent)
    if (parts.isNullOrEmpty()) return

    val sender = parts[0].originatingAddress ?: return
    if (!numbersMatch(sender, watchedNumber)) return

    val body = parts.joinToString(separator = "") { it.messageBody ?: "" }
    val receivedAt = parts[0].timestampMillis
    val id = UUID.randomUUID().toString()

    val entry = JSONObject().apply {
      put("id", id)
      put("sender", sender)
      put("body", body)
      put("receivedAt", receivedAt)
    }
    val queue = JSONArray(prefs.getString(SmsReaderBridge.KEY_PENDING_QUEUE, "[]") ?: "[]")
    queue.put(entry)
    prefs.edit().putString(SmsReaderBridge.KEY_PENDING_QUEUE, queue.toString()).apply()

    SmsReaderBridge.notifyMessage(SmsMessagePayload(id, sender, body, receivedAt))
  }

  /** Compares only the trailing digits so "+33612345678" and "0612345678" still match. */
  private fun numbersMatch(a: String, b: String): Boolean {
    val digitsA = a.filter { it.isDigit() }
    val digitsB = b.filter { it.isDigit() }
    if (digitsA.isEmpty() || digitsB.isEmpty()) return false
    val shortest = minOf(digitsA.length, digitsB.length)
    return digitsA.takeLast(shortest) == digitsB.takeLast(shortest)
  }
}
