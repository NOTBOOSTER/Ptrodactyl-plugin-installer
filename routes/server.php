<?php

use Illuminate\Support\Facades\Route;
use MinecraftPluginInstaller\Http\Controllers\MinecraftPluginInstallerController;

Route::prefix('plugins')->group(function () {
    Route::get('/', [MinecraftPluginInstallerController::class, 'index']);
    Route::get('/minecraft-versions', [MinecraftPluginInstallerController::class, 'getMinecraftVersions']);
    Route::get('/loaders', [MinecraftPluginInstallerController::class, 'getPluginLoaders']);
    Route::get('/installed', [MinecraftPluginInstallerController::class, 'getInstalledPluginsVersions']);
    Route::get('/{pluginId}/versions', [MinecraftPluginInstallerController::class, 'versions']);
    Route::post('/download-details', [MinecraftPluginInstallerController::class, 'downloadDetails']);
    Route::post('/install', [MinecraftPluginInstallerController::class, 'install']);
});
