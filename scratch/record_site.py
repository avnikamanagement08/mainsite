import os
import time
import shutil
import subprocess
from playwright.sync_api import sync_playwright

def record_session():
    # 1. Start local web server in the background
    port = 8085
    project_dir = r"c:\Users\Shashank Tiwari\Desktop\jewel"
    print(f"Starting python http.server on port {port}...")
    server_process = subprocess.Popen(
        ["python", "-m", "http.server", str(port)],
        cwd=project_dir
    )
    
    # Give the server time to start up
    time.sleep(3)
    
    video_tmp_dir = os.path.join(project_dir, "temp_video_record")
    if os.path.exists(video_tmp_dir):
        shutil.rmtree(video_tmp_dir)
    os.makedirs(video_tmp_dir, exist_ok=True)
    
    final_dest = r"C:\Users\Shashank Tiwari\.gemini\antigravity\brain\8f419c5f-1bf8-472d-91c9-9c4bf4dcc8e1\site_tour.webm"
    
    try:
        with sync_playwright() as p:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            
            # Instagram Reel layout aspect ratio is 9:16 (540x960 viewport)
            context = browser.new_context(
                viewport={"width": 540, "height": 960},
                device_scale_factor=2, # high DPI for crisp text
                record_video_dir=video_tmp_dir,
                record_video_size={"width": 540, "height": 960}
            )
            
            # Injection to hide prices
            hide_prices_css = """
            .product-price, .product-price-row, #zoomedProductPrice, .qv-price-row,
            .qv-price-discounted, .qv-price-original, .cart-item-price,
            .checkout-summary-row, .checkout-summary-total, #summarySubtotal,
            #summaryShipping, #summaryDiscount, #summaryTax, #summaryTotal,
            .cart-item-details .price, #cartSubtotal, #cartShipping, #cartDiscount,
            #cartTotal, #stickyCartTotal, .sm-cart-total, [class*="price"], [id*="price"],
            .selection-price, .cart-item-details span, .price-display {
                display: none !important;
            }
            """
            
            page = context.new_page()
            
            # This script will run on every page navigation
            page.add_init_script("""
            // Inject CSS to hide price elements
            const style = document.createElement('style');
            style.innerHTML = `""" + hide_prices_css + """`;
            document.head.appendChild(style);

            // Periodically check and clean any text node containing Rupee symbol
            setInterval(() => {
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                let node;
                while (node = walker.nextNode()) {
                    if (node.nodeValue.includes('₹') || node.nodeValue.includes('Rs.')) {
                        node.nodeValue = node.nodeValue.replace(/₹\\s*\\d+(,\\d+)*(\\.\\d+)?/g, '').replace(/Rs\\.\\s*\\d+(,\\d+)*(\\.\\d+)?/g, '');
                    }
                }
            }, 100);
            """)
            
            print("Navigating to home page...")
            page.goto(f"http://localhost:{port}/index.html")
            
            print("Waiting for loader to dismiss...")
            try:
                page.wait_for_selector("#loader", state="hidden", timeout=5000)
            except Exception:
                pass
            time.sleep(3.0)
            
            # --- Homepage Browsing --- (0:07 - 0:23)
            print("Scrolling hero and intro slowly...")
            # Scroll down slowly to showcase design
            for y in range(0, 1600, 200):
                page.mouse.wheel(0, 200)
                time.sleep(1.5)
            time.sleep(2.0)
            
            # --- Wishlist Demo --- (0:23 - 0:37)
            print("Testing wishlist feature...")
            # Scroll back up to product cards
            page.mouse.wheel(0, -1000)
            time.sleep(2.0)
            
            # Find and click first wishlist button
            page.evaluate('document.querySelector(".product-btn.wishlist").click()')
            print("Clicked wishlist button.")
            time.sleep(3.0)
            
            # Open wishlist drawer
            page.evaluate('document.getElementById("wishlistToggleBtn").click()')
            print("Opened wishlist drawer.")
            time.sleep(6.0)
                
            # Close wishlist drawer
            page.evaluate('document.getElementById("wishlistCloseBtn").click()')
            print("Closed wishlist drawer.")
            time.sleep(3.0)
            
            # --- Quick View & Add to Cart --- (0:37 - 0:49)
            print("Opening quick view modal...")
            # Click on first product card (image or title)
            page.evaluate('document.querySelector(".product-card").click()')
            print("Clicked first product card.")
            time.sleep(6.0)
                
            # Add to Cart from quick view
            page.evaluate('document.getElementById("qvAddToCartBtn").click()')
            print("Clicked Add to Cart in Quick View.")
            time.sleep(6.0)
            
            # --- Cart Drawer --- (0:49 - 0:59)
            print("Opening cart drawer...")
            # Toggle cart drawer if not open
            page.evaluate('document.getElementById("cartToggleBtn").click()')
            print("Opened cart drawer.")
            time.sleep(5.0)
                
            # Click Checkout
            page.evaluate('document.getElementById("checkoutBtn").click()')
            print("Clicked checkout button.")
            time.sleep(5.0)
            
            # --- Checkout Page --- (0:59 - 1:23)
            print("Filling checkout details...")
            # Wait for checkout loader if any
            try:
                page.wait_for_selector("#loader", state="hidden", timeout=3000)
            except Exception:
                pass
            time.sleep(2.0)
            
            # Step 1: Order Review -> Continue to Shipping
            page.evaluate('document.getElementById("btn-continue-to-shipping").click()')
            print("Proceeded to shipping step.")
            time.sleep(3.0)
                
            # Step 2: Shipping Form
            page.fill("#shipName", "Jane Mitchell")
            time.sleep(1.5)
            page.fill("#shipPhone", "9876543210")
            time.sleep(1.5)
            page.fill("#shipPincode", "400001")
            time.sleep(1.5)
            page.fill("#shipState", "Maharashtra")
            time.sleep(1.5)
            page.fill("#shipCity", "Mumbai")
            time.sleep(1.5)
            page.fill("#shipAddress", "Flat 405, Sunshine Heights, Bandra West")
            time.sleep(4.0)
            
            # Submit shipping form
            page.evaluate('document.getElementById("shippingForm").dispatchEvent(new Event("submit"))')
            print("Submitted shipping address.")
            time.sleep(4.0)
                
            # Step 3: Payment Choice -> COD
            page.evaluate('document.getElementById("payCOD").click()')
            print("Selected COD payment option.")
            time.sleep(4.0)
                
            # Complete order (1:23 - 1:35)
            page.evaluate('document.getElementById("btnPlaceOrder").click()')
            print("Clicked Complete Order.")
            time.sleep(12.0) # wait on success screen
            
            # Wait for video recording to settle
            time.sleep(1)
            video_path = page.video.path()
            print("Video recorded successfully at:", video_path)
            
            browser.close()
            
            # Copy to final destination
            shutil.copy(video_path, final_dest)
            print("Copied video file to:", final_dest)
            
    except Exception as e:
        print("An error occurred during recording:", e)
        
    finally:
        # 3. Terminate python http.server
        print("Shutting down local server...")
        server_process.terminate()
        server_process.wait()
        print("Server shutdown complete.")
        
        # Clean up temporary video directory
        if os.path.exists(video_tmp_dir):
            shutil.rmtree(video_tmp_dir)
            print("Cleaned up temp video files.")

if __name__ == "__main__":
    record_session()
