import request from "supertest";
import app from "../src";
import { config } from "../src/constant/config";
import { pgp } from "../src/lib/pg-connection";

let server: any;

beforeAll(() => {
  server = app.listen(config.APP_PORT || 9000);
});

afterAll((done) => {
  server.close((err: any) => {
    if (err) {
      done(err);
    } else {
      pgp.end();
      done();
    }
  });
});

describe("Promotion", () => {
  it("get promotion", async () => {
    const response = await request(app)
      .post("/api/promotion/item")
      .send({
        customer: {
          customer_id: -99,
          area_id: 2,
        },
        current_date: "2025-01-17T08:51:12.902Z",
        items: [
          {
            menu_id: 4,
            qty: 1,
            amount: 25000,
          },
        ],
        grand_total: 50000,
      });

    expect(response.statusCode).toEqual(200);
  });

  it("should create a promotion with free item reward", async () => {
    const payload = {
      promotion_name: "promotion free itemssss",
      quota: 0,
      minimum_spending: 50000,
      start_date: "2025-01-17",
      end_date: null,
      is_expired: false,
      is_limited: false,
      created_by: "admin",
      customer_target_type: "all",
      promotion_rewards: {
        reward_type: "free_item",
        discount_type: null,
        discount_amount: null,
        max_discount_amount: null,
      },
      promotion_reward_menu: [
        {
          target_id: 20,
          quantity: 1,
        },
      ],
      promotion_customer: [
        {
          target_id: -99,
        },
      ],
      promotion_menu_rules: [
        {
          target_id: 2,
          quantity: 1,
        },
      ],
    };

    const response = await request(app).post("/api/promotion").send(payload);

    console.log("Response Body:", response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Promotion created successfully",
      data: expect.any(Object),
    });
  });
});
