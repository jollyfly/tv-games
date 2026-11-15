package com.jolly.numberisland

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.TextView
import androidx.webkit.WebViewAssetLoader

/**
 * Minimal, offline Android TV shell for the HTML/SVG game.
 *
 * Design constraints:
 *  - no INTERNET permission; local content only
 *  - one Activity, landscape, immersive
 *  - all remote keys are forwarded to the web app as semantic actions
 *  - back is consumed by the game; the game opens the exit confirmation
 */
class MainActivity : Activity() {

    companion object {
        private const val GAME_URL = "https://appassets.androidplatform.net/assets/www/index.html"
        private const val PREFS = "number_island"
        private const val SAVE_KEY = "save_v1"
        private const val MAX_SAVE_BYTES = 128 * 1024
        private const val BACK_LONG_MS = 1200L
        private const val CONFIRM_DEBOUNCE_MS = 280L
    }

    private lateinit var root: FrameLayout
    private var webView: WebView? = null
    private val handler = Handler(Looper.getMainLooper())
    private val prefs by lazy { getSharedPreferences(PREFS, Context.MODE_PRIVATE) }
    private val audioManager by lazy { getSystemService(Context.AUDIO_SERVICE) as AudioManager }

    private var webReady = false
    private var errorMode = false
    private var backDown = false
    private var backLongFired = false
    private var lastConfirmAt = 0L
    private var renderCrashCount = 0
    private var audioFocusRequest: Any? = null

    private val backLongRunnable = Runnable {
        if (backDown && !errorMode) {
            backLongFired = true
            sendAction("back_long")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        root = FrameLayout(this).apply { setBackgroundColor(Color.rgb(255, 246, 230)) }
        setContentView(root)
        installWebView()
        root.post { hideSystemUi() }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun installWebView() {
        errorMode = false
        webReady = false
        root.removeAllViews()

        val wv = WebView(this)
        webView = wv
        wv.setBackgroundColor(Color.rgb(255, 246, 230))
        wv.alpha = 0f
        wv.isFocusable = true
        wv.isFocusableInTouchMode = true
        wv.overScrollMode = View.OVER_SCROLL_NEVER
        wv.isVerticalScrollBarEnabled = false
        wv.isHorizontalScrollBarEnabled = false
        wv.isLongClickable = false
        wv.setOnLongClickListener { true }

        wv.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            loadsImagesAutomatically = true
            blockNetworkLoads = true
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            userAgentString = "$userAgentString NumberIslandTV/1.0"
        }
        if (BuildConfig.DEBUG) WebView.setWebContentsDebuggingEnabled(true)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        wv.addJavascriptInterface(Bridge(), "NumberIslandNative")
        wv.webChromeClient = WebChromeClient()
        wv.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest) =
                assetLoader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                // Only the local asset origin is allowed. There are no external links.
                val host = request.url.host ?: return true
                return host != "appassets.androidplatform.net"
            }

            override fun onPageFinished(view: WebView, url: String) {
                // The page calls NumberIslandNative.ready() after its first paint.
                handler.postDelayed({ if (!errorMode) revealWebView() }, 2600)
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) showLoadError("点点迷路了。\n按 OK 重试，按返回键退出。")
            }

            override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
                renderCrashCount += 1
                webView = null
                view.destroy()
                showLoadError("游戏画面需要休息一下。\n按 OK 重新加载。")
                return true
            }
        }

        root.addView(wv, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        wv.requestFocus()
        wv.loadUrl(GAME_URL)
    }

    private fun revealWebView() {
        if (webReady || errorMode) return
        webReady = true
        webView?.animate()?.alpha(1f)?.setDuration(260)?.start()
    }

    private fun showLoadError(message: String) {
        if (errorMode) return
        errorMode = true
        webReady = false
        backDown = false
        handler.removeCallbacks(backLongRunnable)
        webView?.let { wv ->
            root.removeView(wv)
            wv.destroy()
        }
        webView = null
        val text = TextView(this).apply {
            text = message
            setTextColor(Color.rgb(35, 49, 63))
            setBackgroundColor(Color.rgb(255, 246, 230))
            gravity = Gravity.CENTER
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 32f)
            setLineSpacing(12f, 1f)
        }
        root.removeAllViews()
        root.addView(text, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        root.requestFocus()
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (errorMode) {
            if (event.action == KeyEvent.ACTION_DOWN) {
                if (event.keyCode == KeyEvent.KEYCODE_BACK) {
                    finish()
                    return true
                }
                if (event.keyCode == KeyEvent.KEYCODE_DPAD_CENTER || event.keyCode == KeyEvent.KEYCODE_ENTER) {
                    handler.postDelayed({ if (!isFinishing) recreate() }, 80)
                    return true
                }
            }
            return true
        }

        val action = actionForKey(event.keyCode)
        if (action == null) return super.dispatchKeyEvent(event)

        if (event.action == KeyEvent.ACTION_DOWN) {
            if (event.keyCode == KeyEvent.KEYCODE_BACK) {
                backDown = true
                if (event.repeatCount > 0 || event.isLongPress) {
                    if (!backLongFired) {
                        backLongFired = true
                        handler.removeCallbacks(backLongRunnable)
                        sendAction("back_long")
                    }
                    return true
                }
                if (!backLongFired) {
                    backLongFired = false
                    handler.removeCallbacks(backLongRunnable)
                    handler.postDelayed(backLongRunnable, BACK_LONG_MS)
                }
                return true
            }
            if (event.repeatCount > 0) return true
            if (event.keyCode == KeyEvent.KEYCODE_DPAD_CENTER || event.keyCode == KeyEvent.KEYCODE_ENTER) {
                val now = SystemClock.uptimeMillis()
                if (now - lastConfirmAt < CONFIRM_DEBOUNCE_MS) return true
                lastConfirmAt = now
            }
            sendAction(action)
            return true
        }

        if (event.action == KeyEvent.ACTION_UP) {
            if (event.keyCode == KeyEvent.KEYCODE_BACK) {
                handler.removeCallbacks(backLongRunnable)
                if (backDown) {
                    backDown = false
                    if (!backLongFired) sendAction("back")
                }
                return true
            }
            return true
        }
        return super.dispatchKeyEvent(event)
    }

    private fun actionForKey(keyCode: Int): String? = when (keyCode) {
        KeyEvent.KEYCODE_DPAD_LEFT -> "left"
        KeyEvent.KEYCODE_DPAD_RIGHT -> "right"
        KeyEvent.KEYCODE_DPAD_UP -> "up"
        KeyEvent.KEYCODE_DPAD_DOWN -> "down"
        KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> "confirm"
        KeyEvent.KEYCODE_BACK -> "back"
        KeyEvent.KEYCODE_MENU -> "menu"
        else -> null
    }

    private fun sendAction(action: String) {
        if (!webReady) return
        val safe = action.replace("'", "")
        sendJs("window.__numberIsland && window.__numberIsland.onNativeKey({action:'$safe',repeat:false});")
    }

    private fun sendJs(script: String) {
        handler.post { webView?.evaluateJavascript(script, null) }
    }

    override fun onPause() {
        handler.removeCallbacks(backLongRunnable)
        backDown = false
        if (!errorMode) {
            sendJs("window.__numberIsland && window.__numberIsland.onAppPause && window.__numberIsland.onAppPause();")
        }
        webView?.onPause()
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        hideSystemUi()
        webView?.onResume()
        if (!errorMode) {
            sendJs("window.__numberIsland && window.__numberIsland.onAppResume && window.__numberIsland.onAppResume();")
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemUi()
    }

    private fun hideSystemUi() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                window.setDecorFitsSystemWindows(false)
                window.insetsController?.let { controller ->
                    controller.hide(WindowInsets.Type.systemBars())
                    controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                }
            } else {
                @Suppress("DEPRECATION")
                window.decorView.systemUiVisibility =
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                        View.SYSTEM_UI_FLAG_FULLSCREEN or
                        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                        View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            }
        } catch (_: Throwable) {
            // Some TV firmware needs a moment before the decor view is ready.
        }
    }

    private fun requestAudioFocus() {
        try {
            val attributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (audioFocusRequest != null) return
                val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(attributes)
                    .setWillPauseWhenDucked(false)
                    .build()
                audioFocusRequest = request
                audioManager.requestAudioFocus(request)
            } else {
                @Suppress("DEPRECATION")
                audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)
            }
        } catch (_: Throwable) {
            // Audio focus is best-effort; TV firmware can vary.
        }
    }

    private fun abandonAudioFocus() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val request = audioFocusRequest as? AudioFocusRequest ?: return
                audioManager.abandonAudioFocusRequest(request)
                audioFocusRequest = null
            } else {
                @Suppress("DEPRECATION")
                audioManager.abandonAudioFocus(null)
            }
        } catch (_: Throwable) {
            // ignore
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        abandonAudioFocus()
        webView?.let {
            root.removeView(it)
            it.destroy()
        }
        webView = null
        super.onDestroy()
    }

    private inner class Bridge {
        @JavascriptInterface
        fun ready() {
            runOnUiThread { revealWebView() }
        }

        @JavascriptInterface
        fun loadState(): String = prefs.getString(SAVE_KEY, "") ?: ""

        @JavascriptInterface
        fun saveState(json: String?) {
            val value = json ?: return
            if (value.isBlank() || value.toByteArray(Charsets.UTF_8).size > MAX_SAVE_BYTES) return
            prefs.edit().putString(SAVE_KEY, value).apply()
        }

        @JavascriptInterface
        fun exitApp() {
            runOnUiThread {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) finishAndRemoveTask() else finish()
            }
        }

        @JavascriptInterface
        fun setAudioFocus(active: Boolean) {
            runOnUiThread {
                if (active) requestAudioFocus() else abandonAudioFocus()
            }
        }
    }
}
