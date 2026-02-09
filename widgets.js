/*
 * Widget Functionality
 * Handles the "What's on your mind?" widget interactions.
 */

document.addEventListener('DOMContentLoaded', function () {
    const postTrigger = document.querySelector('#quick-post-trigger');
    const postInput = document.querySelector('#quick-post-text');
    const feedContainer = document.querySelector('#newsfeed-items-grid');

    if (postTrigger && postInput && feedContainer) {
        postTrigger.addEventListener('click', function () {
            const content = postInput.value.trim();

            if (content === '') {
                return; // Don't post empty content
            }

            // Create new post HTML structure
            const newPostHTML = `
        <!-- WIDGET BOX -->
        <div class="widget-box no-padding">
          <!-- WIDGET BOX SETTINGS -->
          <div class="widget-box-settings">
            <!-- POST SETTINGS WRAP -->
            <div class="post-settings-wrap">
              <!-- POST SETTINGS -->
              <div class="post-settings widget-box-post-settings-dropdown-trigger">
                <!-- POST SETTINGS ICON -->
                <svg class="post-settings-icon icon-more-dots">
                  <use xlink:href="#svg-more-dots"></use>
                </svg>
                <!-- /POST SETTINGS ICON -->
              </div>
              <!-- /POST SETTINGS -->
      
              <!-- SIMPLE DROPDOWN -->
              <div class="simple-dropdown widget-box-post-settings-dropdown">
                <!-- SIMPLE DROPDOWN LINK -->
                <p class="simple-dropdown-link">Edit Post</p>
                <!-- /SIMPLE DROPDOWN LINK -->
      
                <!-- SIMPLE DROPDOWN LINK -->
                <p class="simple-dropdown-link">Delete Post</p>
                <!-- /SIMPLE DROPDOWN LINK -->
      
                <!-- SIMPLE DROPDOWN LINK -->
                <p class="simple-dropdown-link">Make it Featured</p>
                <!-- /SIMPLE DROPDOWN LINK -->
      
                <!-- SIMPLE DROPDOWN LINK -->
                <p class="simple-dropdown-link">Report Post</p>
                <!-- /SIMPLE DROPDOWN LINK -->
      
                <!-- SIMPLE DROPDOWN LINK -->
                <p class="simple-dropdown-link">Report Author</p>
                <!-- /SIMPLE DROPDOWN LINK -->
              </div>
              <!-- /SIMPLE DROPDOWN -->
            </div>
            <!-- /POST SETTINGS WRAP -->
          </div>
          <!-- /WIDGET BOX SETTINGS -->
          
          <!-- WIDGET BOX STATUS -->
          <div class="widget-box-status">
            <!-- WIDGET BOX STATUS CONTENT -->
            <div class="widget-box-status-content">
              <!-- USER STATUS -->
              <div class="user-status">
                <!-- USER STATUS AVATAR -->
                <a class="user-status-avatar" href="profile-timeline.html">
                  <!-- USER AVATAR -->
                  <div class="user-avatar small no-outline">
                    <!-- USER AVATAR CONTENT -->
                    <div class="user-avatar-content">
                      <!-- HEXAGON -->
                      <div class="hexagon-image-30-32" data-src="img/avatar/01.jpg"></div>
                      <!-- /HEXAGON -->
                    </div>
                    <!-- /USER AVATAR CONTENT -->
                
                    <!-- USER AVATAR PROGRESS -->
                    <div class="user-avatar-progress">
                      <!-- HEXAGON -->
                      <div class="hexagon-progress-40-44"></div>
                      <!-- /HEXAGON -->
                    </div>
                    <!-- /USER AVATAR PROGRESS -->
                
                    <!-- USER AVATAR PROGRESS BORDER -->
                    <div class="user-avatar-progress-border">
                      <!-- HEXAGON -->
                      <div class="hexagon-border-40-44"></div>
                      <!-- /HEXAGON -->
                    </div>
                    <!-- /USER AVATAR PROGRESS BORDER -->
                
                    <!-- USER AVATAR BADGE -->
                    <div class="user-avatar-badge">
                      <!-- USER AVATAR BADGE BORDER -->
                      <div class="user-avatar-badge-border">
                        <!-- HEXAGON -->
                        <div class="hexagon-22-24"></div>
                        <!-- /HEXAGON -->
                      </div>
                      <!-- /USER AVATAR BADGE BORDER -->
                
                      <!-- USER AVATAR BADGE CONTENT -->
                      <div class="user-avatar-badge-content">
                        <!-- HEXAGON -->
                        <div class="hexagon-dark-16-18"></div>
                        <!-- /HEXAGON -->
                      </div>
                      <!-- /USER AVATAR BADGE CONTENT -->
                
                      <!-- USER AVATAR BADGE TEXT -->
                      <p class="user-avatar-badge-text">24</p>
                      <!-- /USER AVATAR BADGE TEXT -->
                    </div>
                    <!-- /USER AVATAR BADGE -->
                  </div>
                  <!-- /USER AVATAR -->
                </a>
                <!-- /USER STATUS AVATAR -->
            
                <!-- USER STATUS TITLE -->
                <p class="user-status-title medium"><a class="bold" href="profile-timeline.html">Marina Valentine</a> posted a status update</p>
                <!-- /USER STATUS TITLE -->
            
                <!-- USER STATUS TEXT -->
                <p class="user-status-text small">Just now</p>
                <!-- /USER STATUS TEXT -->
              </div>
              <!-- /USER STATUS -->

              <!-- WIDGET BOX STATUS TEXT -->
              <p class="widget-box-status-text">${content}</p>
              <!-- /WIDGET BOX STATUS TEXT -->
            </div>
            <!-- /WIDGET BOX STATUS CONTENT -->
          </div>
          <!-- /WIDGET BOX STATUS -->

          <!-- POST OPTIONS -->
          <div class="post-options">
            <!-- POST OPTION WRAP -->
            <div class="post-option-wrap">
              <!-- POST OPTION -->
              <div class="post-option reaction-options-dropdown-trigger">
                <!-- POST OPTION ICON -->
                <svg class="post-option-icon icon-thumbs-up">
                  <use xlink:href="#svg-thumbs-up"></use>
                </svg>
                <!-- /POST OPTION ICON -->

                <!-- POST OPTION TEXT -->
                <p class="post-option-text">React!</p>
                <!-- /POST OPTION TEXT -->
              </div>
              <!-- /POST OPTION -->

              <!-- REACTION OPTIONS -->
              <div class="reaction-options reaction-options-dropdown">
                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Like">
                  <img class="reaction-option-image" src="img/reaction/like.png" alt="reaction-like">
                </div>
                <!-- /REACTION OPTION -->

                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Love">
                  <img class="reaction-option-image" src="img/reaction/love.png" alt="reaction-love">
                </div>
                <!-- /REACTION OPTION -->

                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Dislike">
                  <img class="reaction-option-image" src="img/reaction/dislike.png" alt="reaction-dislike">
                </div>
                <!-- /REACTION OPTION -->

                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Happy">
                  <img class="reaction-option-image" src="img/reaction/happy.png" alt="reaction-happy">
                </div>
                <!-- /REACTION OPTION -->

                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Funny">
                  <img class="reaction-option-image" src="img/reaction/funny.png" alt="reaction-funny">
                </div>
                <!-- /REACTION OPTION -->

                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Wow">
                  <img class="reaction-option-image" src="img/reaction/wow.png" alt="reaction-wow">
                </div>
                <!-- /REACTION OPTION -->

                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Angry">
                  <img class="reaction-option-image" src="img/reaction/angry.png" alt="reaction-angry">
                </div>
                <!-- /REACTION OPTION -->

                <!-- REACTION OPTION -->
                <div class="reaction-option text-tooltip-tft" data-title="Sad">
                  <img class="reaction-option-image" src="img/reaction/sad.png" alt="reaction-sad">
                </div>
                <!-- /REACTION OPTION -->
              </div>
              <!-- /REACTION OPTIONS -->
            </div>
            <!-- /POST OPTION WRAP -->

            <!-- POST OPTION -->
            <div class="post-option">
              <!-- POST OPTION ICON -->
              <svg class="post-option-icon icon-comment">
                <use xlink:href="#svg-comment"></use>
              </svg>
              <!-- /POST OPTION ICON -->

              <!-- POST OPTION TEXT -->
              <p class="post-option-text">Comment</p>
              <!-- /POST OPTION TEXT -->
            </div>
            <!-- /POST OPTION -->

            <!-- POST OPTION -->
            <div class="post-option">
              <!-- POST OPTION ICON -->
              <svg class="post-option-icon icon-share">
                <use xlink:href="#svg-share"></use>
              </svg>
              <!-- /POST OPTION ICON -->

              <!-- POST OPTION TEXT -->
              <p class="post-option-text">Share</p>
              <!-- /POST OPTION TEXT -->
            </div>
            <!-- /POST OPTION -->
          </div>
          <!-- /POST OPTIONS -->
        </div>
        <!-- /WIDGET BOX -->
      `;

            // Prepend the new post to the feed
            feedContainer.insertAdjacentHTML('afterbegin', newPostHTML);

            // --- DYNAMIC CONTENT INITIALIZATION ---
            const newPost = feedContainer.firstElementChild;

            // 1. Initialize Hexagon for Author Avatar
            try {
                const hexagonAvatar = newPost.querySelector('.hexagon-image-30-32');
                if (hexagonAvatar && app.plugins.createHexagon) {
                    app.plugins.createHexagon({
                        containerElement: hexagonAvatar,
                        width: 30,
                        height: 32,
                        roundedCorners: true,
                        roundedCornerRadius: 1,
                        clip: true
                    });
                }
            } catch (e) {
                console.error('Error initializing hexagon:', e);
            }

            // 2. Initialize Settings Dropdown
            try {
                const settingsTrigger = newPost.querySelector('.widget-box-post-settings-dropdown-trigger');
                const settingsContainer = newPost.querySelector('.widget-box-post-settings-dropdown');

                if (settingsTrigger && settingsContainer && app.plugins.createDropdown) {
                    app.plugins.createDropdown({
                        triggerElement: settingsTrigger,
                        containerElement: settingsContainer,
                        offset: {
                            top: 30,
                            right: 9
                        },
                        animation: {
                            type: 'translate-top',
                            speed: .3,
                            translateOffset: {
                                vertical: 20
                            }
                        }
                    });
                }
            } catch (e) {
                console.error('Error initializing settings dropdown:', e);
            }

            // 3. Initialize Reaction Dropdown
            try {
                const reactionTrigger = newPost.querySelector('.reaction-options-dropdown-trigger');
                const reactionContainer = newPost.querySelector('.reaction-options-dropdown');

                if (reactionTrigger && reactionContainer && app.plugins.createDropdown) {
                    app.plugins.createDropdown({
                        triggerElement: reactionTrigger,
                        containerElement: reactionContainer,
                        triggerEvent: 'click',
                        offset: {
                            bottom: 54,
                            left: -16
                        },
                        animation: {
                            type: 'translate-bottom',
                            speed: .3,
                            translateOffset: {
                                vertical: 20
                            }
                        },
                        closeOnDropdownClick: true
                    });
                }
            } catch (e) {
                console.error('Error initializing reaction dropdown:', e);
            }

            // Clear the input
            postInput.value = '';
            postInput.focus();
        });
    } else {
        console.warn('Widgets: Required elements not found', { postTrigger, postInput, feedContainer });
    }
});
