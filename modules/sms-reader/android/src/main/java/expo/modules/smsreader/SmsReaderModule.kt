package expo.modules.smsreader

import android.content.Context
import android.content.SharedPreferences
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray

class SmsReaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsReader")

    Events(SmsReaderBridge.MESSAGE_RECEIVED_EVENT)

    OnCreate {
      SmsReaderBridge.register { message ->
        sendEvent(
          SmsReaderBridge.MESSAGE_RECEIVED_EVENT,
          bundleOf(
            "id" to message.id,
            "sender" to message.sender,
            "body" to message.body,
            "receivedAt" to message.receivedAt
          )
        )
      }
    }

    OnDestroy {
      SmsReaderBridge.unregister()
    }

    Function("setWatchedNumber") { number: String ->
      prefs().edit().putString(SmsReaderBridge.KEY_WATCHED_NUMBER, number).apply()
    }

    Function("getWatchedNumber") {
      prefs().getString(SmsReaderBridge.KEY_WATCHED_NUMBER, null)
    }

    Function("drainPendingMessages") {
      drainQueue()
    }
  }

  private fun prefs(): SharedPreferences {
    val context = appContext.reactContext
      ?: throw IllegalStateException("React context is not available")
    return context.getSharedPreferences(SmsReaderBridge.PREFS_NAME, Context.MODE_PRIVATE)
  }

  private fun drainQueue(): List<Map<String, Any?>> {
    val sharedPreferences = prefs()
    val raw = sharedPreferences.getString(SmsReaderBridge.KEY_PENDING_QUEUE, "[]") ?: "[]"
    val array = JSONArray(raw)
    val result = mutableListOf<Map<String, Any?>>()
    for (i in 0 until array.length()) {
      val item = array.getJSONObject(i)
      result.add(
        mapOf(
          "id" to item.getString("id"),
          "sender" to item.getString("sender"),
          "body" to item.getString("body"),
          "receivedAt" to item.getLong("receivedAt")
        )
      )
    }
    sharedPreferences.edit().putString(SmsReaderBridge.KEY_PENDING_QUEUE, "[]").apply()
    return result
  }
}
