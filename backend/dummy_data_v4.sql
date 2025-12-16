-- Insert into auth.users (Trigger will create profiles and service_agents)
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES
('e0e63d1c-b27b-435f-a877-ab92eb6e7bed', 'authenticated', 'authenticated', 'user1@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 1", "role": "tenant"}', NOW(), NOW()),
('cf0f7eff-ff2c-47cc-8e0d-3e0fbcce8d71', 'authenticated', 'authenticated', 'user2@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 2", "role": "tenant"}', NOW(), NOW()),
('d2636731-3df6-454e-b190-175f8e588b10', 'authenticated', 'authenticated', 'user3@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 3", "role": "tenant"}', NOW(), NOW()),
('b5235323-f5b0-44cf-9b8e-29d166c4e6c8', 'authenticated', 'authenticated', 'user4@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 4", "role": "tenant"}', NOW(), NOW()),
('537c3af9-3d0b-4b13-9809-09b83681700c', 'authenticated', 'authenticated', 'user5@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 5", "role": "tenant"}', NOW(), NOW()),
('b4b23d02-f8b4-4da6-b862-1a11b30ee43c', 'authenticated', 'authenticated', 'user6@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 6", "role": "service_agent", "service_type": "plumber", "experience_years": 2}', NOW(), NOW()),
('cdeffeb2-024a-4bda-9aca-873fa3f18f7a', 'authenticated', 'authenticated', 'user7@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 7", "role": "service_agent", "service_type": "electrician", "experience_years": 3}', NOW(), NOW()),
('91b0b119-1f34-4ba2-a046-2dfda28086ef', 'authenticated', 'authenticated', 'user8@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 8", "role": "service_agent", "service_type": "cleaner", "experience_years": 4}', NOW(), NOW()),
('540ec84a-8f24-4955-ac01-dde6861a03d3', 'authenticated', 'authenticated', 'user9@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 9", "role": "service_agent", "service_type": "other", "experience_years": 5}', NOW(), NOW()),
('0cf40b5d-cc08-4428-8edd-6f921fa8b32f', 'authenticated', 'authenticated', 'user10@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABC', NOW(), '{"full_name": "User 10", "role": "service_agent", "service_type": "plumber", "experience_years": 6}', NOW(), NOW());

-- Update public.profiles (Created by trigger)
UPDATE public.profiles SET phone_number = '1234567890', address = 'Address 1', aadhaar_id = 'AADHAAR1', is_active = true WHERE id = 'e0e63d1c-b27b-435f-a877-ab92eb6e7bed';
UPDATE public.profiles SET phone_number = '1234567891', address = 'Address 2', aadhaar_id = 'AADHAAR2', is_active = true WHERE id = 'cf0f7eff-ff2c-47cc-8e0d-3e0fbcce8d71';
UPDATE public.profiles SET phone_number = '1234567892', address = 'Address 3', aadhaar_id = 'AADHAAR3', is_active = true WHERE id = 'd2636731-3df6-454e-b190-175f8e588b10';
UPDATE public.profiles SET phone_number = '1234567893', address = 'Address 4', aadhaar_id = 'AADHAAR4', is_active = true WHERE id = 'b5235323-f5b0-44cf-9b8e-29d166c4e6c8';
UPDATE public.profiles SET phone_number = '1234567894', address = 'Address 5', aadhaar_id = 'AADHAAR5', is_active = true WHERE id = '537c3af9-3d0b-4b13-9809-09b83681700c';
UPDATE public.profiles SET phone_number = '1234567895', address = 'Address 6', aadhaar_id = 'AADHAAR6', is_active = true WHERE id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c';
UPDATE public.profiles SET phone_number = '1234567896', address = 'Address 7', aadhaar_id = 'AADHAAR7', is_active = true WHERE id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a';
UPDATE public.profiles SET phone_number = '1234567897', address = 'Address 8', aadhaar_id = 'AADHAAR8', is_active = true WHERE id = '91b0b119-1f34-4ba2-a046-2dfda28086ef';
UPDATE public.profiles SET phone_number = '1234567898', address = 'Address 9', aadhaar_id = 'AADHAAR9', is_active = true WHERE id = '540ec84a-8f24-4955-ac01-dde6861a03d3';
UPDATE public.profiles SET phone_number = '1234567899', address = 'Address 10', aadhaar_id = 'AADHAAR10', is_active = true WHERE id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f';

-- Update public.service_agents (Created by trigger for agents)
UPDATE public.service_agents SET is_approved = true, rating = 4.5, availability_status = 'available' WHERE user_id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c';
UPDATE public.service_agents SET is_approved = true, rating = 4.5, availability_status = 'available' WHERE user_id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a';
UPDATE public.service_agents SET is_approved = true, rating = 4.5, availability_status = 'available' WHERE user_id = '91b0b119-1f34-4ba2-a046-2dfda28086ef';
UPDATE public.service_agents SET is_approved = true, rating = 4.5, availability_status = 'available' WHERE user_id = '540ec84a-8f24-4955-ac01-dde6861a03d3';
UPDATE public.service_agents SET is_approved = true, rating = 4.5, availability_status = 'available' WHERE user_id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f';

-- Insert into public.rooms
INSERT INTO public.rooms (id, room_number, capacity, floor, status, created_at) VALUES
('6109750c-58b0-4b50-bf05-7a412a0d9322', '100', 2, 1, 'occupied', NOW()),
('3455d55e-b2d3-4b51-96a4-60d8d2c85c17', '101', 2, 1, 'occupied', NOW()),
('045c3ba6-c92b-499a-836f-a7f3b0b6bc5b', '102', 2, 1, 'occupied', NOW()),
('724e7300-3055-48cf-97b5-7a6af142f5c6', '103', 2, 1, 'occupied', NOW()),
('c3828358-fa8b-4525-bad0-74457034a91d', '104', 2, 1, 'occupied', NOW()),
('d18bb940-8a8d-401c-84cf-59d7b27db739', '105', 2, 1, 'vacant', NOW()),
('2f9effcf-8c41-4939-9d74-0d47a9370ce8', '106', 2, 1, 'vacant', NOW()),
('8719ff18-2fb8-4e06-a521-aaaa92e24322', '107', 2, 1, 'vacant', NOW()),
('bcdfc8ce-d211-4e98-bcd5-eb11d5fce8df', '108', 2, 1, 'vacant', NOW()),
('4a895dfe-d766-4926-8159-b6ef4da27381', '109', 2, 1, 'vacant', NOW());

-- Insert into public.tenants
INSERT INTO public.tenants (id, user_id, room_id, check_in_date, check_out_date, rent_amount, created_at) VALUES
('1da6fdac-132b-4ebe-aa57-396ed21f2d61', 'e0e63d1c-b27b-435f-a877-ab92eb6e7bed', '6109750c-58b0-4b50-bf05-7a412a0d9322', '2024-01-01', '2024-12-31', 5000.00, NOW()),
('2e2d120f-2957-4421-a665-21c1e8caaeb3', 'cf0f7eff-ff2c-47cc-8e0d-3e0fbcce8d71', '3455d55e-b2d3-4b51-96a4-60d8d2c85c17', '2024-01-01', '2024-12-31', 5000.00, NOW()),
('06ef9827-c888-4e36-8015-7113e571dfcf', 'd2636731-3df6-454e-b190-175f8e588b10', '045c3ba6-c92b-499a-836f-a7f3b0b6bc5b', '2024-01-01', '2024-12-31', 5000.00, NOW()),
('ed05351a-3058-47a4-abca-1e583428d928', 'b5235323-f5b0-44cf-9b8e-29d166c4e6c8', '724e7300-3055-48cf-97b5-7a6af142f5c6', '2024-01-01', '2024-12-31', 5000.00, NOW()),
('2f47f465-012b-45f6-aa7d-0b7471cb0d4d', '537c3af9-3d0b-4b13-9809-09b83681700c', 'c3828358-fa8b-4525-bad0-74457034a91d', '2024-01-01', '2024-12-31', 5000.00, NOW());

-- Insert into public.complaints
INSERT INTO public.complaints (id, tenant_id, room_id, service_type, agent_id, description, status, created_at, updated_at) VALUES
('cf21084c-6999-41ab-ab99-60e0f36b9982', '1da6fdac-132b-4ebe-aa57-396ed21f2d61', '6109750c-58b0-4b50-bf05-7a412a0d9322', 'plumber', (SELECT id FROM public.service_agents WHERE user_id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c'), 'Issue 1', 'open', NOW(), NOW()),
('e15c7bd0-51be-457c-9fab-dad9384fbcc8', '2e2d120f-2957-4421-a665-21c1e8caaeb3', '3455d55e-b2d3-4b51-96a4-60d8d2c85c17', 'electrician', (SELECT id FROM public.service_agents WHERE user_id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a'), 'Issue 2', 'open', NOW(), NOW()),
('b3c6c1b4-73e0-4eb7-ab74-bc7721cf96a4', '06ef9827-c888-4e36-8015-7113e571dfcf', '045c3ba6-c92b-499a-836f-a7f3b0b6bc5b', 'cleaner', (SELECT id FROM public.service_agents WHERE user_id = '91b0b119-1f34-4ba2-a046-2dfda28086ef'), 'Issue 3', 'open', NOW(), NOW()),
('1f6d9b96-73b3-48c9-a6e1-297d4f5edc47', 'ed05351a-3058-47a4-abca-1e583428d928', '724e7300-3055-48cf-97b5-7a6af142f5c6', 'other', (SELECT id FROM public.service_agents WHERE user_id = '540ec84a-8f24-4955-ac01-dde6861a03d3'), 'Issue 4', 'open', NOW(), NOW()),
('fc163f1f-02a9-4563-b794-3ae8a40acad6', '2f47f465-012b-45f6-aa7d-0b7471cb0d4d', 'c3828358-fa8b-4525-bad0-74457034a91d', 'plumber', (SELECT id FROM public.service_agents WHERE user_id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f'), 'Issue 5', 'open', NOW(), NOW()),
('5c3878ab-c294-40d1-a3f6-a2510d7bf150', '1da6fdac-132b-4ebe-aa57-396ed21f2d61', '6109750c-58b0-4b50-bf05-7a412a0d9322', 'plumber', (SELECT id FROM public.service_agents WHERE user_id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c'), 'Issue 6', 'open', NOW(), NOW()),
('be042ea8-1348-436c-9058-7106078108f8', '2e2d120f-2957-4421-a665-21c1e8caaeb3', '3455d55e-b2d3-4b51-96a4-60d8d2c85c17', 'electrician', (SELECT id FROM public.service_agents WHERE user_id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a'), 'Issue 7', 'open', NOW(), NOW()),
('39a0e12f-a374-487d-a838-9c424266b51a', '06ef9827-c888-4e36-8015-7113e571dfcf', '045c3ba6-c92b-499a-836f-a7f3b0b6bc5b', 'cleaner', (SELECT id FROM public.service_agents WHERE user_id = '91b0b119-1f34-4ba2-a046-2dfda28086ef'), 'Issue 8', 'open', NOW(), NOW()),
('9fc9b049-cd30-433a-96c8-08fc7ed8593c', 'ed05351a-3058-47a4-abca-1e583428d928', '724e7300-3055-48cf-97b5-7a6af142f5c6', 'other', (SELECT id FROM public.service_agents WHERE user_id = '540ec84a-8f24-4955-ac01-dde6861a03d3'), 'Issue 9', 'open', NOW(), NOW()),
('8d36cecd-2c02-4a28-91e4-e2a925da7af2', '2f47f465-012b-45f6-aa7d-0b7471cb0d4d', 'c3828358-fa8b-4525-bad0-74457034a91d', 'plumber', (SELECT id FROM public.service_agents WHERE user_id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f'), 'Issue 10', 'open', NOW(), NOW());

-- Insert into public.service_tasks
INSERT INTO public.service_tasks (id, complaint_id, agent_id, assigned_at, started_at, completed_at, status) VALUES
('b925398b-3152-444a-ba71-7dc7e11d4b1b', 'cf21084c-6999-41ab-ab99-60e0f36b9982', (SELECT id FROM public.service_agents WHERE user_id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c'), NOW(), NOW(), NOW(), 'assigned'),
('aa5b16d2-fbc2-4d82-a649-f1a3129e30aa', 'e15c7bd0-51be-457c-9fab-dad9384fbcc8', (SELECT id FROM public.service_agents WHERE user_id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a'), NOW(), NOW(), NOW(), 'assigned'),
('7fc1bf89-1ff4-4226-a30c-51bfe3e25032', 'b3c6c1b4-73e0-4eb7-ab74-bc7721cf96a4', (SELECT id FROM public.service_agents WHERE user_id = '91b0b119-1f34-4ba2-a046-2dfda28086ef'), NOW(), NOW(), NOW(), 'assigned'),
('70cf660a-14cd-46dd-ba61-bf8f631274b0', '1f6d9b96-73b3-48c9-a6e1-297d4f5edc47', (SELECT id FROM public.service_agents WHERE user_id = '540ec84a-8f24-4955-ac01-dde6861a03d3'), NOW(), NOW(), NOW(), 'assigned'),
('7a219210-a25d-43d4-825b-3d8a5a782ee2', 'fc163f1f-02a9-4563-b794-3ae8a40acad6', (SELECT id FROM public.service_agents WHERE user_id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f'), NOW(), NOW(), NOW(), 'assigned'),
('f499798a-1946-4496-aec2-69cbacd4d32a', '5c3878ab-c294-40d1-a3f6-a2510d7bf150', (SELECT id FROM public.service_agents WHERE user_id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c'), NOW(), NOW(), NOW(), 'assigned'),
('f73cccc6-ff17-4e7e-827b-f63088caabaa', 'be042ea8-1348-436c-9058-7106078108f8', (SELECT id FROM public.service_agents WHERE user_id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a'), NOW(), NOW(), NOW(), 'assigned'),
('32fbe857-36e8-41fa-b32c-166555b8a4ef', '39a0e12f-a374-487d-a838-9c424266b51a', (SELECT id FROM public.service_agents WHERE user_id = '91b0b119-1f34-4ba2-a046-2dfda28086ef'), NOW(), NOW(), NOW(), 'assigned'),
('38b6f448-316e-4cd8-9b3b-afbfbf5b15b4', '9fc9b049-cd30-433a-96c8-08fc7ed8593c', (SELECT id FROM public.service_agents WHERE user_id = '540ec84a-8f24-4955-ac01-dde6861a03d3'), NOW(), NOW(), NOW(), 'assigned'),
('58e42ef0-2a0a-4d34-8341-b0fbd2a2fc9f', '8d36cecd-2c02-4a28-91e4-e2a925da7af2', (SELECT id FROM public.service_agents WHERE user_id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f'), NOW(), NOW(), NOW(), 'assigned');

-- Insert into public.agent_ratings
INSERT INTO public.agent_ratings (id, agent_id, tenant_id, complaint_id, rating, feedback, created_at) VALUES
('7b14ed6f-a43a-4252-9eb6-01b28d62ec33', (SELECT id FROM public.service_agents WHERE user_id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c'), '1da6fdac-132b-4ebe-aa57-396ed21f2d61', 'cf21084c-6999-41ab-ab99-60e0f36b9982', 5, 'Great job', NOW()),
('06938bf6-a850-4123-895b-0d8e89784c60', (SELECT id FROM public.service_agents WHERE user_id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a'), '2e2d120f-2957-4421-a665-21c1e8caaeb3', 'e15c7bd0-51be-457c-9fab-dad9384fbcc8', 5, 'Great job', NOW()),
('249e6f75-5d0c-49b2-a6c5-4a5a36da6d77', (SELECT id FROM public.service_agents WHERE user_id = '91b0b119-1f34-4ba2-a046-2dfda28086ef'), '06ef9827-c888-4e36-8015-7113e571dfcf', 'b3c6c1b4-73e0-4eb7-ab74-bc7721cf96a4', 5, 'Great job', NOW()),
('f49fe442-ea65-44b9-8bae-ad2ed9886b7e', (SELECT id FROM public.service_agents WHERE user_id = '540ec84a-8f24-4955-ac01-dde6861a03d3'), 'ed05351a-3058-47a4-abca-1e583428d928', '1f6d9b96-73b3-48c9-a6e1-297d4f5edc47', 5, 'Great job', NOW()),
('682a5853-7d90-45ab-acee-7c5c516cf8b1', (SELECT id FROM public.service_agents WHERE user_id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f'), '2f47f465-012b-45f6-aa7d-0b7471cb0d4d', 'fc163f1f-02a9-4563-b794-3ae8a40acad6', 5, 'Great job', NOW()),
('2cd0c568-b990-40d9-8dce-c8f5fba809bf', (SELECT id FROM public.service_agents WHERE user_id = 'b4b23d02-f8b4-4da6-b862-1a11b30ee43c'), '1da6fdac-132b-4ebe-aa57-396ed21f2d61', '5c3878ab-c294-40d1-a3f6-a2510d7bf150', 5, 'Great job', NOW()),
('4465020c-d24e-4df7-9d35-0e6aed74f994', (SELECT id FROM public.service_agents WHERE user_id = 'cdeffeb2-024a-4bda-9aca-873fa3f18f7a'), '2e2d120f-2957-4421-a665-21c1e8caaeb3', 'be042ea8-1348-436c-9058-7106078108f8', 5, 'Great job', NOW()),
('48d4a659-2550-4d4f-8497-b99afd83a27d', (SELECT id FROM public.service_agents WHERE user_id = '91b0b119-1f34-4ba2-a046-2dfda28086ef'), '06ef9827-c888-4e36-8015-7113e571dfcf', '39a0e12f-a374-487d-a838-9c424266b51a', 5, 'Great job', NOW()),
('43299556-1195-4ba7-bb57-8457306f5876', (SELECT id FROM public.service_agents WHERE user_id = '540ec84a-8f24-4955-ac01-dde6861a03d3'), 'ed05351a-3058-47a4-abca-1e583428d928', '9fc9b049-cd30-433a-96c8-08fc7ed8593c', 5, 'Great job', NOW()),
('00cc9b5d-b1d9-4501-b3b2-546b8fc3b224', (SELECT id FROM public.service_agents WHERE user_id = '0cf40b5d-cc08-4428-8edd-6f921fa8b32f'), '2f47f465-012b-45f6-aa7d-0b7471cb0d4d', '8d36cecd-2c02-4a28-91e4-e2a925da7af2', 5, 'Great job', NOW());

