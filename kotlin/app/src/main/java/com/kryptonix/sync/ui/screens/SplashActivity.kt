package com.kryptonix.sync.ui.screens

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.delay

/**
 * Splash activity handling cold starts and user session scans.
 * Immediately performs security verification via standard Android EncryptedSharedPreferences
 * supported by hardware keystore capabilities.
 */
class SplashActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0A0E17)), // Kryptonix Midnight background
                contentAlignment = Alignment.Center
            ) {
                // Secure loading state indicator
                CircularProgressIndicator(
                    modifier = Modifier.size(64.dp),
                    color = Color(0xFF00E5FF) // Kryptonix accent cyan
                )

                LaunchedEffect(Unit) {
                    val userIsAuthenticated = checkActiveUserSession()
                    delay(1200) // Aesthetic delay for seamless UI transitions
                    
                    if (userIsAuthenticated) {
                        navigateToMainDashboard()
                    } else {
                        navigateToOnboarding()
                    }
                }
            }
        }
    }

    /**
     * Checks if there's a valid session stored in EncryptedSharedPreferences.
     */
    private fun checkActiveUserSession(): Boolean {
        return try {
            val masterKey = MasterKey.Builder(this)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            val securePrefs = EncryptedSharedPreferences.create(
                this,
                "kryptonix_secure_prefs",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
            val savedToken = securePrefs.getString("auth_token_key", null)
            val clientBusinessId = securePrefs.getString("client_id_key", null)
            
            !savedToken.isNullOrBlank() && !clientBusinessId.isNullOrBlank()
        } catch (e: Exception) {
            false // Any cryptographic access issues trigger fallback routing
        }
    }

    private fun navigateToMainDashboard() {
        // Safe navigation to secondary compose container
        startActivity(Intent(this, ChatDashboardActivity::class.java))
        finish()
    }

    private fun navigateToOnboarding() {
        // Navigate to onboarding login screen
        // startActivity(Intent(this, OnboardingActivity::class.java))
        // For demonstration, we simply let our compose state routers process this
    }
}

// Stub for illustration of dashboard container
class ChatDashboardActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }
}
