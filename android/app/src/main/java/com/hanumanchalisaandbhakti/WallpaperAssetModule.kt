package com.hanumanchalisaandbhakti

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Rect
import android.graphics.Shader
import android.os.Build
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.net.URL

/**
 * Builds a phone-sized wallpaper from a bundled image.
 *
 * The artwork is portrait 9:16 but phones are ~9:20, so a plain centre-crop cuts off the sides.
 * Instead the picture is fitted to the full screen width and the space above/below is filled
 * with a soft blurred copy of the same picture, feathered into the sharp image.
 *
 * `source` is either an http(s) URL (debug builds, served by Metro) or a drawable resource
 * name (release builds). Returns a file:// URI the wallpaper library can read.
 */
class WallpaperAssetModule(private val ctx: ReactApplicationContext) :
    ReactContextBaseJavaModule(ctx) {

  override fun getName() = "WallpaperAsset"

  @ReactMethod
  fun prepareForScreen(source: String, promise: Promise) {
    Thread {
      try {
        val src = load(source) ?: run {
          promise.reject("E_NOT_FOUND", "Could not load image: $source")
          return@Thread
        }
        val (w, h) = screenSize()
        val composed = compose(src, w, h)
        val out = File(ctx.cacheDir, "wallpaper_${source.hashCode()}.jpg")
        out.outputStream().use { composed.compress(Bitmap.CompressFormat.JPEG, 95, it) }
        promise.resolve("file://" + out.absolutePath)
      } catch (e: Throwable) {
        promise.reject("E_PREPARE", e)
      }
    }.start()
  }

  private fun load(source: String): Bitmap? {
    val opts = BitmapFactory.Options().apply { inPreferredConfig = Bitmap.Config.ARGB_8888 }
    return if (source.startsWith("http://") || source.startsWith("https://")) {
      URL(source).openStream().use { BitmapFactory.decodeStream(it, null, opts) }
    } else {
      val id = ctx.resources.getIdentifier(source, "drawable", ctx.packageName)
      if (id == 0) null else BitmapFactory.decodeResource(ctx.resources, id, opts)
    }
  }

  @Suppress("DEPRECATION")
  private fun screenSize(): Pair<Int, Int> {
    val wm = ctx.getSystemService(android.content.Context.WINDOW_SERVICE) as WindowManager
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val b = wm.maximumWindowMetrics.bounds
      Pair(minOf(b.width(), b.height()), maxOf(b.width(), b.height()))
    } else {
      val m = android.util.DisplayMetrics()
      wm.defaultDisplay.getRealMetrics(m)
      Pair(minOf(m.widthPixels, m.heightPixels), maxOf(m.widthPixels, m.heightPixels))
    }
  }

  private fun compose(src: Bitmap, w: Int, h: Int): Bitmap {
    val out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(out)
    val smooth = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)

    // 1) Blurred "cover" background (shrink hard, then scale back up = cheap, smooth blur).
    val coverScale = maxOf(w.toFloat() / src.width, h.toFloat() / src.height)
    val cw = (src.width * coverScale).toInt()
    val ch = (src.height * coverScale).toInt()
    val tiny = Bitmap.createScaledBitmap(src, maxOf(w / 40, 8), maxOf(h / 40, 8), true)
    val blurred = Bitmap.createScaledBitmap(tiny, cw, ch, true)
    canvas.drawBitmap(blurred, ((w - cw) / 2f), ((h - ch) / 2f), smooth)

    // 2) Sharp image fitted to full width, vertically centred.
    val fitH = (src.height * (w.toFloat() / src.width)).toInt()
    val top = (h - fitH) / 2
    val layer = Bitmap.createBitmap(w, fitH, Bitmap.Config.ARGB_8888)
    val lc = Canvas(layer)
    lc.drawBitmap(src, null, Rect(0, 0, w, fitH), smooth)

    // 3) Feather the top/bottom edges so the sharp image melts into the blur.
    val feather = minOf(fitH / 8f, w * 0.2f) // keep in sync with WallpaperCanvas.tsx
    val mask = Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN) }
    mask.shader = LinearGradient(0f, 0f, 0f, feather, 0x00000000, 0xFF000000.toInt(), Shader.TileMode.CLAMP)
    lc.drawRect(0f, 0f, w.toFloat(), feather, mask)
    mask.shader = LinearGradient(0f, fitH - feather, 0f, fitH.toFloat(), 0xFF000000.toInt(), 0x00000000, Shader.TileMode.CLAMP)
    lc.drawRect(0f, fitH - feather, w.toFloat(), fitH.toFloat(), mask)

    canvas.drawBitmap(layer, 0f, top.toFloat(), smooth)
    return out
  }
}
