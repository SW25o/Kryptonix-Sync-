package com.kryptonix.sync.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val KryptonixMidnight = Color(0xFF0A0E17)
val KryptonixDarkGray = Color(0xFF141A29)
val KryptonixCyanAccent = Color(0xFF00E5FF)
val KryptonixCyanMuted = Color(0xFF00A2B4)
val KryptonixGrayMuted = Color(0xFF49556E)
val KryptonixTextWhite = Color(0xFFFFFFFF)

private val DarkColorScheme = darkColorScheme(
    primary = KryptonixCyanAccent,
    secondary = KryptonixCyanMuted,
    background = KryptonixMidnight,
    surface = KryptonixDarkGray,
    onPrimary = Color.Black,
    onBackground = KryptonixTextWhite,
    onSurface = KryptonixTextWhite,
    error = Color(0xFFFF5252)
)

@Composable
fun KryptonixSyncTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // Kryptonix applications exclusively employ a dark/eye-safe midnight visual foundation
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = androidx.compose.material3.Typography(),
        content = content
    )
}
