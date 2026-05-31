package com.kryptonix.sync.crypto

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Enterprise-grade End-to-End Encryption (E2EE) helper class.
 * Leverages the Android Keystore to generate and bind 256-bit AES-GCM keys within a secure hardware enclaving environment (TEE/SE).
 * Messages are encrypted client-side before submission to any cloud persistence layers.
 */
object E2EEncryptor {
    private const val ANDROID_KEYSTORE_PROVIDER = "AndroidKeyStore"
    private const val AES_GCM_TRANSFORMATION = "AES/GCM/NoPadding"
    private const val KEY_ALIAS = "KryptonixSync_Secure_Key_v1"
    private const val TAG_LENGTH_BITS = 128
    private const val IV_LENGTH_BYTES = 12

    init {
        getOrCreateSecretKey()
    }

    /**
     * Retrieves or creates a hardware-backed SecretKey from the Secure Android Keystore.
     */
    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE_PROVIDER).apply { load(null) }
        val existingKey = keyStore.getKey(KEY_ALIAS, null) as? SecretKey
        if (existingKey != null) return existingKey

        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE_PROVIDER)
        val spec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()

        keyGenerator.init(spec)
        return keyGenerator.generateKey()
    }

    /**
     * Encrypts plain text into a structured GCM Ciphertext packet (IV + Ciphertext) and encodes it in Base64.
     */
    fun encrypt(plainText: String): String {
        val cipher = Cipher.getInstance(AES_GCM_TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateSecretKey())
        
        val iv = cipher.iv
        val cipherBytes = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
        
        // Combine IV (fixed 12 bytes) and encrypted bytes
        val messageBuffer = ByteArray(iv.size + cipherBytes.size)
        System.arraycopy(iv, 0, messageBuffer, 0, iv.size)
        System.arraycopy(cipherBytes, 0, messageBuffer, iv.size, cipherBytes.size)

        return Base64.encodeToString(messageBuffer, Base64.NO_WRAP)
    }

    /**
     * Decrypts a Base64-encoded structural packet (IV + Ciphertext) back into plain text.
     */
    fun decrypt(encryptedPayload: String): String {
        val combinedBytes = Base64.decode(encryptedPayload, Base64.NO_WRAP)
        if (combinedBytes.size <= IV_LENGTH_BYTES) {
            throw IllegalArgumentException("Malformed ciphertext packet")
        }

        // Extract IV and Ciphertext bytes
        val iv = ByteArray(IV_LENGTH_BYTES)
        val cipherBytes = ByteArray(combinedBytes.size - IV_LENGTH_BYTES)
        System.arraycopy(combinedBytes, 0, iv, 0, IV_LENGTH_BYTES)
        System.arraycopy(combinedBytes, IV_LENGTH_BYTES, cipherBytes, 0, cipherBytes.size)

        val cipher = Cipher.getInstance(AES_GCM_TRANSFORMATION)
        val spec = GCMParameterSpec(TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.DECRYPT_MODE, getOrCreateSecretKey(), spec)

        val decryptedBytes = cipher.doFinal(cipherBytes)
        return String(decryptedBytes, Charsets.UTF_8)
    }
}
