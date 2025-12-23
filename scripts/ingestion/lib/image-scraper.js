const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class ImageScraper {
    constructor() {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    calculateHash(buffer) {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    async searchGoogleImages(query, maxResults = 15) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=isz:l`;
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 15000
            });

            const imageUrls = [];
            const regex = /"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi;
            const matches = response.data.matchAll(regex);

            for (const match of matches) {
                const url = match[1];
                if (url.includes('gstatic') || url.includes('google') || url.includes('logo') || url.includes('icon') || url.length > 500) {
                    continue;
                }
                imageUrls.push(url);
                if (imageUrls.length >= maxResults) break;
            }
            return imageUrls;
        } catch (error) {
            console.error(`Error searching images for "${query}":`, error.message);
            return [];
        }
    }

    async downloadImage(url) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 20000,
                headers: { 'User-Agent': this.userAgent, 'Referer': 'https://www.google.com/' },
                maxRedirects: 5
            });

            const buffer = Buffer.from(response.data);
            const size = buffer.length;

            if (size < 50000) return { success: false, error: 'Too small' }; // Increased minimum size for quality
            if (size > 10000000) return { success: false, error: 'Too large' };

            const hash = this.calculateHash(buffer);
            return { success: true, buffer, size, hash, extension: url.toLowerCase().includes('.png') ? 'png' : 'jpg' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new ImageScraper();
