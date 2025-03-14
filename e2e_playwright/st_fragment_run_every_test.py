# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2024)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from playwright.sync_api import Page, expect


def test_fragment_runs_at_interval(app: Page):
    fragment_text = app.get_by_test_id("stMarkdown").first.text_content()

    # Verify that the fragment text updates a few times.
    for _ in range(3):
        expect(app.get_by_test_id("stMarkdown").first).not_to_have_text(fragment_text)
        fragment_text = app.get_by_test_id("stMarkdown").first.text_content()
