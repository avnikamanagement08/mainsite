import os
import subprocess
from static_ffmpeg import run

def main():
    video_path = r"C:\Users\Shashank Tiwari\.gemini\antigravity\brain\8f419c5f-1bf8-472d-91c9-9c4bf4dcc8e1\site_tour.webm"
    audio_path = r"C:\Users\Shashank Tiwari\Downloads\speechma_audio_Swara_at_11_49_33 PM_on_June_13th_2026.mp3"
    
    # Check if files exist
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return
        
    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found at {audio_path}")
        return
        
    # Final outputs
    out_mp4_project = r"c:\Users\Shashank Tiwari\Desktop\jewel\site_tour_with_audio.mp4"
    out_mp4_desktop = r"c:\Users\Shashank Tiwari\Desktop\site_tour_with_audio.mp4"
    out_mp4_artifact = r"C:\Users\Shashank Tiwari\.gemini\antigravity\brain\8f419c5f-1bf8-472d-91c9-9c4bf4dcc8e1\site_tour_with_audio.mp4"
    
    print("Getting FFmpeg binaries...")
    ffmpeg_exe, ffprobe_exe = run.get_or_fetch_platform_executables_else_raise()
    print(f"FFmpeg executable: {ffmpeg_exe}")
    
    # We will encode the video to libx264 and audio to aac for best Instagram Reels compatibility.
    # We will use yuv420p pixel format as it's required for mobile/Instagram playback.
    cmd = [
        ffmpeg_exe,
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-y",
        out_mp4_artifact
    ]
    
    print("Running FFmpeg conversion command...")
    print(" ".join(cmd))
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("Success! Merged audio and video.")
        # Copy to Desktop and project folder
        import shutil
        shutil.copy(out_mp4_artifact, out_mp4_project)
        print(f"Copied to project: {out_mp4_project}")
        shutil.copy(out_mp4_artifact, out_mp4_desktop)
        print(f"Copied to Desktop: {out_mp4_desktop}")
    else:
        print("Error during FFmpeg execution:")
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)

if __name__ == "__main__":
    main()
