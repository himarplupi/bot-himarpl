# Panduan Kontribusi Bot HIMARPL

Terima kasih atas minat Anda untuk berkontribusi pada Bot HIMARPL. Sebelum Anda melanjutkan, bacalah singkat hal-hal berikut:

- [Kode Etik](https://github.com/himarplupi/bot-himarpl/blob/main/CODE_OF_CONDUCT.md)
- [Kontribusi](#kontribusi)
- [Memulai](#memulai)
  - [Perintah CLI](#perintah-cli)
- [Pedoman Commit](#pedoman-commit)
- [Kebijakan Pull Request](#kebijakan-pull-request)
- [Sertifikat Asal Pengembang 1.1](#sertifikat-asal-pengembang-11)

## Kontribusi

Setiap individu dipersilakan untuk berkontribusi pada Bot HIMARPL. Repositori ini saat ini memiliki dua jenis persona:

- **Kontributor** adalah setiap individu yang membuat isu/PR, mengomentari isu/PR, atau berkontribusi dengan cara lain.

- **Kolaborator** adalah setiap individu yang mereview isu/PR, mengelola isu/PR, atau berkontribusi dengan cara lain yang aktif dalam berdiskusi dan pengambilan keputusan dalam proyek ini.

## Memulai

Langkah-langkah di bawah ini akan memberi Anda gambaran umum tentang cara mempersiapkan lingkungan lokal Anda untuk Bot HIMARPL.

1. Klik tombol fork di kanan atas untuk menyalin [Repositori Bot HIMARPL](https://github.com/himarplupi/bot-himarpl/fork)

2. Clone fork Anda menggunakan SSH, GitHub CLI, atau HTTPS.

   ```bash
   git clone git@github.com:<NAMA_PENGGUNA_GITHUB_ANDA>/bot-himarpl.git # SSH
   git clone https://github.com/<NAMA_PENGGUNA_GITHUB_ANDA>/bot-himarpl.git # HTTPS
   gh repo clone <NAMA_PENGGUNA_GITHUB_ANDA>/bot-himarpl # GitHub CLI
   ```

3. Pindah ke direktori blog-himarpl.

   ```bash
   cd bot-himarpl
   ```

   1. **Prasyarat untuk file .env**: Buat file `.env` di root proyek.

   2. Ikuti panduan memulai di [NeonDB](https://neon.tech/docs/get-started-with-neon/connect-neon#obtaining-connection-details) untuk `DATABASE_URL`.

      ```bash
      DATABASE_URL=
      ```

   3. Ikuti panduan membuat bot Telegram di [Dokumentasi Telegram API](https://core.telegram.org/bots#how-do-i-create-a-bot) untuk mendapatkan kredensial OAuth 2.0 dari Google API Console untuk nilai `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`.

      ```bash
      GOOGLE_CLIENT_ID=
      GOOGLE_CLIENT_SECRET=
      ```

   4. Ikuti panduan memulai di [Upstash Ratelimiting](https://upstash.com/docs/oss/sdks/ts/ratelimit/gettingstarted) untuk mendapatkan nilai `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`.

      ```bash
      UPSTASH_REDIS_REST_URL=
      UPSTASH_REDIS_REST_TOKEN=
      ```

4. Buat remote untuk menjaga fork dan clone lokal Anda tetap terbaru.

   ```bash
   git remote add upstream git@github.com:himarplupi/bot-himarpl.git # SSH
   git remote add upstream https://github.com/himarplupi/bot-himarpl.git # HTTPS
   gh repo sync himarplupi/bot-himarpl # GitHub CLI
   ```

5. Buat cabang baru untuk pekerjaan Anda.

   ```bash
   git checkout -b nama-cabang-anda
   ```

6. Jalankan perintah berikut untuk menginstal dependensi dan memulai pratinjau lokal dari pekerjaan Anda.

   ```bash
   npm run db:push # mendorong skema database ke NeonDB
   npm ci # menginstal dependensi proyek ini
   npm run dev # memulai lingkungan pengembangan
   npm run ngrok # memulai ngrok untuk webhook Telegram
   npm run tl:set-webhook <URL_NGROK> # tuliskan URL ngrok ke webhook Telegram
   ```

7. Lakukan perubahan Anda. Jika Anda tidak familiar dengan struktur repositori ini, kami merekomendasikan membaca [Website Dokumentasi HIMARPL](https://docs.himarpl.com).

8. Lakukan merge untuk menyinkronkan cabang Anda saat ini dengan cabang upstream.

   ```bash
   git fetch upstream
   git merge upstream/main
   ```

9. Setelah Anda puas dengan perubahan Anda, tambahkan dan commit perubahan tersebut ke cabang Anda, lalu push cabang tersebut ke fork Anda.

   ```bash
   cd ~/bot-himarpl
   git add .
   git commit # Silakan ikuti pedoman commit di bawah ini
   git push -u origin nama-cabang-anda
   ```

> [!IMPORTANT]\
> Sebelum commit dan membuka Pull Request, harap baca terlebih dahulu [Pedoman Commit](#pedoman-commit) dan [Kebijakan Pull Request](#kebijakan-pull-request) yang dijelaskan di bawah ini.

11. Buat Pull Request.

> [!NOTE]\
> Kami meminta penulis PR untuk menghindari rebase/memperbarui PR mereka dengan cabang dasar (`main`) secara tidak perlu.

### Perintah CLI

Repositori ini berisi beberapa skrip dan perintah untuk melakukan berbagai tugas. Perintah yang paling relevan dijelaskan di bawah ini.

<details>
  <summary>Perintah untuk Menjalankan & Membangun Website atau Bot</summary>

- `npm run dev` menjalankan Server Pengembangan Lokal Next.js, mendengarkan secara default di `http://localhost:3000/`.
- `npm run build` membangun Aplikasi dalam mode Produksi. Outputnya secara default berada di dalam folder `.next`.
  - Ini digunakan untuk Blog HIMARPL Vercel Deployments (Pratinjau & Produksi)
- `npm run start` memulai server web yang menjalankan konten yang dibangun dari `npm run build`
- `npm run ngrok` membuat localhost Anda dapat diakses dari internet melalui ngrok.
- `npm run tl:set-webhook <URL_NGROK>` mengubah webhook Telegram ke URL ngrok.
- `npm run tl:set-command` mengatur perintah bot Telegram (pastikan untuk menuliskan perintah di file `setCommands.js` juga).

</details>

<details>
  <summary>Perintah untuk Tugas Pemeliharaan dan Tes</summary>

- `npm run db:push` mendorong skema database ke NeonDB.
- `npm run db:studio` menjalankan prisma studio untuk manajemen database.
- `npm run lint` menjalankan linter untuk semua file.
- `npm run test` menjalankan semua tes secara lokal

</details>

## Pedoman Commit

Proyek ini mengikuti spesifikasi [Conventional Commits][].

Commit harus ditandatangani. Anda bisa membaca lebih lanjut tentang [Penandatanganan Commit][] di sini.

### Pedoman Pesan Commit

- Pesan commit harus menyertakan "type" seperti yang dijelaskan pada Conventional Commits
- Pesan commit **tidak boleh** diakhiri dengan tanda titik `.`

## Kebijakan Pull Request

Kebijakan ini mengatur bagaimana kontribusi harus dilakukan dalam repositori ini. Baris di bawah ini menyatakan pemeriksaan dan kebijakan yang harus diikuti sebelum menggabungkan dan saat menggabungkan.

### Saat menggabungkan

- Semua pemeriksaan Status yang diperlukan harus lulus.
- Pastikan bahwa semua diskusi telah diselesaikan.
- [`squash`][] pull request yang terdiri dari beberapa commit

## Sertifikat Asal Pengembang 1.1

```
Dengan berkontribusi pada proyek ini, saya menyatakan bahwa:

- (a) Kontribusi dibuat seluruhnya atau sebagian oleh saya dan saya memiliki hak untuk mengajukannya dibawah lisensi open source yang ditunjukkan dalam file; atau
- (b) Kontribusi didasarkan pada pekerjaan sebelumnya yang, sepengetahuan saya, dilindungi oleh lisensi open source yang sesuai dan saya memiliki hak di bawah lisensi tersebut untuk mengajukan pekerjaan tersebut dengan modifikasi, baik yang dibuat seluruhnya atau sebagian oleh saya, di bawah lisensi open source yang sama (kecuali saya diizinkan untuk mengajukannya di bawah lisensi yang berbeda), seperti yang ditunjukkan dalam file; atau
- (c) Kontribusi disediakan langsung kepada saya oleh orang lain yang menyatakan (a), (b) atau (c) dan saya tidak mengubahnya.
- (d) Saya memahami dan setuju bahwa proyek ini dan kontribusi adalah publik dan bahwa catatan kontribusi (termasuk semua informasi pribadi yang saya ajukan dengan kontribusi tersebut, termasuk tanda tangan saya) disimpan tanpa batas waktu dan dapat didistribusikan kembali sesuai dengan proyek ini atau lisensi open source yang terlibat.
```

[`squash`]: https://help.github.com/en/articles/about-pull-request-merges#squash-and-merge-your-pull-request-commits
[Conventional Commits]: https://www.conventionalcommits.org/
[Penandatanganan Commit]: https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits
