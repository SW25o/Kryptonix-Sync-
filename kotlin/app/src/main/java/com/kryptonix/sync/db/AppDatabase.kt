package com.kryptonix.sync.db

import android.content.Context
import androidx.room.Database
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import net.sqlcipher.database.SupportFactory
import net.sqlcipher.database.SQLiteDatabase

@Entity(tableName = "secure_messages")
data class SecureMessageEntity(
    @PrimaryKey val messageId: String,
    val roomId: String,
    val senderId: String,
    val encryptedPayload: String,
    val timestamp: Long,
    val isRead: Boolean = false,
    val deliverState: Int = 0 // 0 = Sent, 1 = Delivered, 2 = Read
)

@Entity(tableName = "user_sessions")
data class UserSessionEntity(
    @PrimaryKey val uniqueUserId: String,
    val businessName: String,
    val authorizationToken: String,
    val activeKeyPairAlias: String,
    val localSetupTimestamp: Long
)

@Database(entities = [SecureMessageEntity::class, UserSessionEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    
    // Abstract DAOs would go here (e.g. ChatRoomDao, SessionDao)
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        /**
         * Returns an instance of the AppDatabase encrypted with SQLCipher on-disk.
         * By integrating net.sqlcipher.database.SupportFactory, the entire SQL database file is 
         * transparently encrypted with AES-256 before any disk write operations.
         */
        fun getEncryptedDatabase(context: Context, cryptographicPassphrase: ByteArray): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                SQLiteDatabase.loadLibs(context)
                val factory = SupportFactory(cryptographicPassphrase)
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "kryptonix_secure.db"
                )
                    .openHelperFactory(factory)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
